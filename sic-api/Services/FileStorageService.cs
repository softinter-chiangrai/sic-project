using System.Security.Claims;
using System.Text;
using Amazon.S3;
using Amazon.S3.Model;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using sic_api.Extensions;
using sic_api.Data;
using sic_api.Entities.Su;
using sic_api.Model.Storage;
using sic_api.Services.Interfaces;

namespace sic_api.Services;

public class FileStorageService(
    IAmazonS3 s3Client,
    IOptions<StorageOptions> storageOptions,
    IBusinessAccessService businessAccessService,
    SicDbContext dbContext,
    IMediaProcessingService mediaProcessingService) : IFileStorageService
{
    private const string EncodedMetadataPrefix = "utf8b64:";
    private static readonly TimeSpan TemporaryUploadLifetime = TimeSpan.FromHours(24);

    private static readonly string[] ImageContentTypes =
    [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "image/svg+xml",
        "image/bmp"
    ];

    private static readonly string[] VideoContentTypes =
    [
        "video/mp4",
        "video/mpeg",
        "video/quicktime",
        "video/webm",
        "video/x-msvideo",
        "video/x-matroska"
    ];

    private static readonly string[] DocumentContentTypes =
    [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "text/plain",
        "text/csv",
        .. ImageContentTypes
    ];

    public async Task<StorageUploadResult> UploadAsync(
        IFormFile file,
        FileCategory category,
        FileVisibility visibility,
        Guid? uploadGroupId = null,
        HttpContext? httpContext = null,
        CancellationToken cancellationToken = default)
    {
        if (file.Length <= 0)
        {
            throw new InvalidOperationException("Uploaded file is empty.");
        }

        ValidateContentType(file, category);

        var user = httpContext?.User
                   ?? throw new UnauthorizedAccessException("No HttpContext user.");
        var uploaderUserId = user.GetKeycloakUserId();
        var uploaderUsername = user.GetPreferredUsername() ?? uploaderUserId;
        var bucketName = ResolveBucketName(category);
        var businessIdResolve = await ResolveBusinessIdAsync(visibility, cancellationToken);
        var businessId = businessIdResolve?.ToString();
        var businessFolder = string.IsNullOrWhiteSpace(businessId) || businessIdResolve == Guid.Empty
            ? "app"
            : SanitizeSegment(businessId);
        var categoryFolder = category.ToString().ToLowerInvariant();
        var safeName = Path.GetFileNameWithoutExtension(file.FileName);
        var normalizedName = SanitizeSegment(string.IsNullOrWhiteSpace(safeName) ? "file" : safeName);
        var basePrefix = $"{businessFolder}/{categoryFolder}/{normalizedName}/{DateTime.UtcNow:yyyyMMddHHmmssfff}-{Guid.NewGuid():N}";

        return category switch
        {
            FileCategory.Image => await UploadImageAsync(
                file,
                visibility,
                uploadGroupId,
                httpContext,
                uploaderUserId,
                uploaderUsername,
                bucketName,
                businessIdResolve,
                businessFolder,
                categoryFolder,
                basePrefix,
                cancellationToken),
            FileCategory.Video => await UploadVideoAsync(
                file,
                visibility,
                uploadGroupId,
                httpContext,
                uploaderUserId,
                uploaderUsername,
                bucketName,
                businessIdResolve,
                businessFolder,
                categoryFolder,
                basePrefix,
                cancellationToken),
            FileCategory.Document => await UploadDocumentAsync(
                file,
                visibility,
                uploadGroupId,
                httpContext,
                uploaderUserId,
                uploaderUsername,
                bucketName,
                businessIdResolve,
                businessFolder,
                categoryFolder,
                basePrefix,
                cancellationToken),
            _ => throw new ArgumentOutOfRangeException(nameof(category), category, null)
        };
    }

    public async Task<StorageDownloadResult> DownloadAsync(
        string bucketName,
        string objectKey,
        ClaimsPrincipal? user,
        int? width = null,
        int? height = null,
        CancellationToken cancellationToken = default)
    {
        var upload = await dbContext.SuUploads
            .AsNoTracking()
            .FirstOrDefaultAsync(
                item => item.BucketName == bucketName && item.ObjectKey == objectKey,
                cancellationToken);

        var metadata = await s3Client.GetObjectMetadataAsync(bucketName, objectKey, cancellationToken);
        var visibility = ParseVisibility(GetMetadataValue(metadata.Metadata, "x-amz-meta-visibility"));
        var uploaderUserId = GetMetadataValue(metadata.Metadata, "x-amz-meta-uploader-user-id");
        var businessId = Guid.TryParse(GetMetadataValue(metadata.Metadata, "x-amz-meta-business-id"), out var parsedBusinessId) ? parsedBusinessId : Guid.Empty;
        var category = GetMetadataValue(metadata.Metadata, "x-amz-meta-category");
        var originalFileName = GetMetadataValue(metadata.Metadata, "x-amz-meta-original-file-name");
        var originalExtension = GetMetadataValue(metadata.Metadata, "x-amz-meta-original-extension");

        if (upload is not null)
        {
            EnsureUploadIsAccessible(upload, user, uploaderUserId);
        }

        if (upload?.IsActive != false)
        {
            await EnsureCanAccessAsync(visibility, uploaderUserId, businessId, user, cancellationToken);
        }

        var response = await s3Client.GetObjectAsync(bucketName, objectKey, cancellationToken);

        if (string.Equals(category, "image", StringComparison.OrdinalIgnoreCase) &&
            (width.HasValue || height.HasValue))
        {
            using var processed = await mediaProcessingService.ResizeImageAsync(
                response.ResponseStream,
                string.IsNullOrWhiteSpace(originalExtension) ? Path.GetExtension(objectKey) : originalExtension,
                width,
                height,
                cancellationToken);

            var bytes = await File.ReadAllBytesAsync(processed.FilePath, cancellationToken);
            return new StorageDownloadResult
            {
                Content = new MemoryStream(bytes),
                ContentType = processed.ContentType,
                FileName = string.IsNullOrWhiteSpace(originalFileName)
                    ? Path.GetFileName(objectKey)
                    : originalFileName
            };
        }

        return new StorageDownloadResult
        {
            Content = response.ResponseStream,
            ContentType = string.IsNullOrWhiteSpace(response.Headers.ContentType)
                ? "application/octet-stream"
                : response.Headers.ContentType,
            FileName = string.IsNullOrWhiteSpace(originalFileName)
                ? Path.GetFileName(objectKey)
                : originalFileName
        };
    }

    public async Task ActivateAsync(
        Guid uploadId,
        ClaimsPrincipal user,
        CancellationToken cancellationToken = default)
    {
        var upload = await dbContext.SuUploads
            .FirstOrDefaultAsync(item => item.Id == uploadId, cancellationToken)
            ?? throw new InvalidOperationException("Upload not found.");

        if (upload.IsActive)
        {
            return;
        }

        if (upload.TempExpiresAt.HasValue && upload.TempExpiresAt.Value <= DateTime.UtcNow)
        {
            throw new InvalidOperationException("Upload has expired and can no longer be activated.");
        }

        if (!CanManageUpload(upload, user))
        {
            throw new UnauthorizedAccessException("Only the uploader can activate this upload.");
        }

        upload.IsActive = true;
        upload.TempExpiresAt = null;
        upload.UpdatedBy = user.GetPreferredUsername() ?? user.GetKeycloakUserId();

        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public Guid? ResolveUploadGroupId(
        Guid? currentUploadGroupId,
        IReadOnlyCollection<StorageUploadReference> uploadReferences)
    {
        var hasActiveUploads = uploadReferences.Any(item => item.State != EntityState.Deleted);
        if (!hasActiveUploads)
        {
            return null;
        }

        if (!currentUploadGroupId.HasValue || currentUploadGroupId.Value == Guid.Empty)
        {
            return Guid.CreateVersion7();
        }

        return currentUploadGroupId;
    }

    public async Task SyncUploadsAsync(
        Guid? uploadGroupId,
        IReadOnlyCollection<StorageUploadReference> uploadReferences,
        CancellationToken cancellationToken = default)
    {
        var deletedUploadIds = uploadReferences
            .Where(item => item.State == EntityState.Deleted)
            .Select(item => item.Id)
            .Distinct()
            .ToArray();

        foreach (var uploadId in deletedUploadIds)
        {
            await DeleteAsync(uploadId, cancellationToken);
        }

        var uploadIds = uploadReferences
            .Where(item => item.State != EntityState.Deleted)
            .Select(item => item.Id)
            .Distinct()
            .ToArray();

        if (uploadIds.Length == 0)
        {
            return;
        }

        var uploads = await dbContext.SuUploads
            .Where(item => uploadIds.Contains(item.Id))
            .ToListAsync(cancellationToken);

        var uploadStates = uploadReferences
            .Where(item => item.State != EntityState.Deleted)
            .GroupBy(item => item.Id)
            .ToDictionary(group => group.Key, group => group.Last());

        foreach (var upload in uploads)
        {
            if (!uploadStates.TryGetValue(upload.Id, out var uploadReference))
            {
                continue;
            }

            upload.UploadGroupId = uploadGroupId;
            upload.IsActive = uploadReference.IsActive;

            if (upload.IsActive)
            {
                upload.TempExpiresAt = null;
            }
        }
    }

    public async Task DeleteUploadsAsync(
        Guid? entityUploadGroupId,
        IReadOnlyCollection<StorageUploadReference> uploadReferences,
        CancellationToken cancellationToken = default)
    {
        var uploadGroupIds = uploadReferences
            .Select(item => item.UploadGroupId)
            .Where(item => item.HasValue)
            .Select(item => item!.Value)
            .Distinct()
            .ToHashSet();

        if (entityUploadGroupId.HasValue)
        {
            uploadGroupIds.Add(entityUploadGroupId.Value);
        }

        foreach (var uploadGroupId in uploadGroupIds)
        {
            await DeleteByGroupIdAsync(uploadGroupId, cancellationToken);
        }

        var uploadIdsWithoutGroup = uploadReferences
            .Where(item => !item.UploadGroupId.HasValue)
            .Select(item => item.Id)
            .Distinct()
            .ToArray();

        foreach (var uploadId in uploadIdsWithoutGroup)
        {
            await DeleteAsync(uploadId, cancellationToken);
        }
    }

    public async Task DeleteAsync(
        Guid uploadId,
        CancellationToken cancellationToken = default)
    {
        var upload = await dbContext.SuUploads
            .FirstOrDefaultAsync(item => item.Id == uploadId, cancellationToken);

        if (upload is null)
        {
            return;
        }

        await DeleteStoredUploadAsync(upload, cancellationToken);
        dbContext.SuUploads.Remove(upload);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteByGroupIdAsync(
        Guid uploadGroupId,
        CancellationToken cancellationToken = default)
    {
        var uploads = await dbContext.SuUploads
            .Where(item => item.UploadGroupId == uploadGroupId)
            .ToListAsync(cancellationToken);

        if (uploads.Count == 0)
        {
            return;
        }

        foreach (var upload in uploads)
        {
            await DeleteStoredUploadAsync(upload, cancellationToken);
        }

        dbContext.SuUploads.RemoveRange(uploads);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task CleanupExpiredTemporaryUploadsAsync(CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        var expiredUploads = await dbContext.SuUploads
            .Where(item => !item.IsActive && item.TempExpiresAt.HasValue && item.TempExpiresAt <= now)
            .ToListAsync(cancellationToken);

        if (expiredUploads.Count == 0)
        {
            return;
        }

        foreach (var upload in expiredUploads)
        {
            await DeleteStoredUploadAsync(upload, cancellationToken);
            upload.IsDelete = true;
            upload.DeleteBy = "system-cleanup";
            upload.DeleteDate = now;
            upload.UpdatedBy = "system-cleanup";
            upload.UpdatedDate = now;
        }

        await dbContext.SaveChangesAsync(cancellationToken);
    }

    private async Task<StorageUploadResult> UploadImageAsync(
        IFormFile file,
        FileVisibility visibility,
        Guid? uploadGroupId,
        HttpContext? httpContext,
        string uploaderUserId,
        string uploaderUsername,
        string bucketName,
        Guid? businessId,
        string businessFolder,
        string categoryFolder,
        string basePrefix,
        CancellationToken cancellationToken)
    {
        var tempExpiresAt = DateTime.UtcNow.Add(TemporaryUploadLifetime);
        using var processed = await mediaProcessingService.NormalizeImageAsync(file, cancellationToken);
        var objectKey = $"{basePrefix}{processed.Extension}";

        await using var stream = File.OpenRead(processed.FilePath);

        await UploadObjectAsync(
            bucketName,
            objectKey,
            stream,
            processed.ContentType,
            CreateMetadata(
                file.FileName,
                Path.GetExtension(file.FileName),
                businessFolder,
                businessId.HasValue ? businessId : null,
                categoryFolder,
                visibility,
                uploaderUserId,
                uploaderUsername),
            cancellationToken);

        var result = CreateUploadResult(
            file,
            visibility,
            uploadGroupId,
            httpContext,
            bucketName,
            objectKey,
            processed.ContentType,
            false);

        await PersistUploadAsync(result, bucketName, objectKey, categoryFolder, businessId, visibility, uploaderUsername, false, tempExpiresAt, cancellationToken);
        return result;
    }

    private async Task<StorageUploadResult> UploadVideoAsync(
        IFormFile file,
        FileVisibility visibility,
        Guid? uploadGroupId,
        HttpContext? httpContext,
        string uploaderUserId,
        string uploaderUsername,
        string bucketName,
        Guid? businessId,
        string businessFolder,
        string categoryFolder,
        string basePrefix,
        CancellationToken cancellationToken)
    {
        var tempExpiresAt = DateTime.UtcNow.Add(TemporaryUploadLifetime);
        using var package = await mediaProcessingService.ConvertVideoToHlsAsync(file, cancellationToken);
        var assetPrefix = $"{basePrefix}/hls";
        var manifestKey = $"{assetPrefix}/{package.PlaylistFileName}";

        foreach (var filePath in package.GetFiles())
        {
            var objectKey = $"{assetPrefix}/{Path.GetFileName(filePath)}";
            var contentType = ResolveVideoAssetContentType(filePath);

            await using var stream = File.OpenRead(filePath);

            await UploadObjectAsync(
                bucketName,
                objectKey,
                stream,
                contentType,
                CreateMetadata(
                    file.FileName,
                    Path.GetExtension(file.FileName),
                    businessFolder,
                    businessId.HasValue ? businessId : null,
                    categoryFolder,
                    visibility,
                    uploaderUserId,
                    uploaderUsername),
                cancellationToken);
        }

        var result = CreateUploadResult(
            file,
            visibility,
            uploadGroupId,
            httpContext,
            bucketName,
            manifestKey,
            "application/vnd.apple.mpegurl",
            true);

        await PersistUploadAsync(result, bucketName, manifestKey, categoryFolder, businessId, visibility, uploaderUsername, true, tempExpiresAt, cancellationToken);
        return result;
    }

    private async Task<StorageUploadResult> UploadDocumentAsync(
        IFormFile file,
        FileVisibility visibility,
        Guid? uploadGroupId,
        HttpContext? httpContext,
        string uploaderUserId,
        string uploaderUsername,
        string bucketName,
        Guid? businessId,
        string businessFolder,
        string categoryFolder,
        string basePrefix,
        CancellationToken cancellationToken)
    {
        var tempExpiresAt = DateTime.UtcNow.Add(TemporaryUploadLifetime);
        var extension = Path.GetExtension(file.FileName);
        var objectKey = $"{basePrefix}{extension}";

        await using var stream = file.OpenReadStream();

        await UploadObjectAsync(
            bucketName,
            objectKey,
            stream,
            file.ContentType,
            CreateMetadata(
                file.FileName,
                extension,
                businessFolder,
                businessId.HasValue ? businessId : null,
                categoryFolder,
                visibility,
                uploaderUserId,
                uploaderUsername),
            cancellationToken);

        var result = CreateUploadResult(
            file,
            visibility,
            uploadGroupId,
            httpContext,
            bucketName,
            objectKey,
            file.ContentType,
            false);

        await PersistUploadAsync(result, bucketName, objectKey, categoryFolder, businessId, visibility, uploaderUsername, false, tempExpiresAt, cancellationToken);
        return result;
    }

    private async Task UploadObjectAsync(
        string bucketName,
        string objectKey,
        Stream inputStream,
        string contentType,
        IDictionary<string, string> metadata,
        CancellationToken cancellationToken)
    {
        var request = new PutObjectRequest
        {
            BucketName = bucketName,
            Key = objectKey,
            InputStream = inputStream,
            ContentType = contentType
        };

        foreach (var item in metadata)
        {
            request.Metadata[item.Key] = item.Value;
        }

        await s3Client.PutObjectAsync(request, cancellationToken);
    }

    private StorageUploadResult CreateUploadResult(
        IFormFile file,
        FileVisibility visibility,
        Guid? uploadGroupId,
        HttpContext? httpContext,
        string bucketName,
        string objectKey,
        string contentType,
        bool isStreaming = false)
    {
        var accessUrl = BuildAccessUrl(httpContext, bucketName, objectKey);

        return new StorageUploadResult
        {
            FileName = file.FileName,
            ContentType = contentType,
            FileSize = file.Length,
            Id = Guid.CreateVersion7(),
            UploadGroupId = uploadGroupId,
            IsStreaming = isStreaming,
            AccessUrl = accessUrl,
            Visibility = visibility.ToString(),
            IsActive = false
        };
    }

    private async Task PersistUploadAsync(
        StorageUploadResult result,
        string bucketName,
        string objectKey,
        string category,
        Guid? businessId,
        FileVisibility visibility,
        string uploaderUsername,
        bool isStreaming,
        DateTime? tempExpiresAt,
        CancellationToken cancellationToken)
    {
        dbContext.SuUploads.Add(new SuUpload
        {
            Id = result.Id,
            UploadGroupId = result.UploadGroupId,
            BusinessId = businessId,
            BucketName = bucketName,
            ObjectKey = objectKey,
            FileName = result.FileName,
            ContentType = result.ContentType,
            FileSize = result.FileSize,
            Category = category,
            Visibility = visibility,
            StorageUrl = BuildStorageUrl(bucketName, objectKey),
            AccessUrl = result.AccessUrl,
            IsStreaming = isStreaming,
            IsActive = false,
            TempExpiresAt = tempExpiresAt,
            CreatedBy = uploaderUsername,
            UpdatedBy = uploaderUsername
        });

        await dbContext.SaveChangesAsync(cancellationToken);
    }

    private static Dictionary<string, string> CreateMetadata(
        string originalFileName,
        string originalExtension,
        string businessFolder,
        Guid? businessId,
        string category,
        FileVisibility visibility,
        string uploaderUserId,
        string uploaderUsername)
    {
        return new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            ["original-file-name"] = EncodeMetadataValue(originalFileName),
            ["original-extension"] = EncodeMetadataValue(originalExtension),
            ["business-folder"] = EncodeMetadataValue(businessFolder),
            ["business-code"] = EncodeMetadataValue(businessId.ToString() ?? string.Empty),
            ["category"] = EncodeMetadataValue(category),
            ["visibility"] = EncodeMetadataValue(visibility.ToString()),
            ["uploader-user-id"] = EncodeMetadataValue(uploaderUserId),
            ["uploader-username"] = EncodeMetadataValue(uploaderUsername)
        };
    }

    private string BuildStorageUrl(string bucketName, string objectKey)
    {
        var serviceUrl = storageOptions.Value.ServiceUrl.TrimEnd('/');
        return $"{serviceUrl}/{bucketName}/{objectKey}";
    }

    private async Task<Guid?> ResolveBusinessIdAsync(FileVisibility visibility, CancellationToken cancellationToken)
    {
        var businessId = businessAccessService.GetBusinessId();
        if (businessId == Guid.Empty)
        {
            if (visibility == FileVisibility.BusinessOnly)
            {
                throw new InvalidOperationException("BusinessOnly visibility requires X-Business-Id.");
            }

            return null;
        }

        var canAccess = await businessAccessService.CanAccessBusinessAsync(businessId, cancellationToken);
        if (!canAccess)
        {
            throw new UnauthorizedAccessException($"User has no access to business_id '{businessId}'.");
        }

        return businessId;
    }

    private async Task EnsureCanAccessAsync(
        FileVisibility visibility,
        string uploaderUserId,
        Guid businessId,
        ClaimsPrincipal? user,
        CancellationToken cancellationToken)
    {
        if (visibility is FileVisibility.AnyoneWithLink or FileVisibility.Public)
        {
            return;
        }

        if (user?.Identity?.IsAuthenticated != true)
        {
            throw new UnauthorizedAccessException("Authentication is required to access this file.");
        }

        var currentUserId = user.GetKeycloakUserId();

        if (visibility == FileVisibility.UploaderOnly)
        {
            if (!string.Equals(currentUserId, uploaderUserId, StringComparison.Ordinal))
            {
                throw new UnauthorizedAccessException("Only the uploader can access this file.");
            }

            return;
        }

        if (visibility == FileVisibility.BusinessOnly)
        {
            if (businessId == Guid.Empty)
            {
                throw new UnauthorizedAccessException("This file is not associated with a business.");
            }

            var canAccess = await businessAccessService.CanAccessBusinessAsync(businessId, cancellationToken);
            if (!canAccess)
            {
                throw new UnauthorizedAccessException("User cannot access this business file.");
            }
        }
    }

    private static bool CanManageUpload(SuUpload upload, ClaimsPrincipal user)
    {
        if (user.Identity?.IsAuthenticated != true)
        {
            return false;
        }

        var currentUserId = user.GetKeycloakUserId();
        var currentUsername = user.GetPreferredUsername();

        return string.Equals(upload.CreatedBy, currentUserId, StringComparison.OrdinalIgnoreCase)
            || string.Equals(upload.CreatedBy, currentUsername, StringComparison.OrdinalIgnoreCase);
    }

    private static void EnsureUploadIsAccessible(SuUpload upload, ClaimsPrincipal? user, string uploaderUserId)
    {
        if (upload.IsActive)
        {
            return;
        }

        if (upload.TempExpiresAt.HasValue && upload.TempExpiresAt.Value <= DateTime.UtcNow)
        {
            throw new InvalidOperationException("Upload has expired.");
        }

        if (user?.Identity?.IsAuthenticated != true)
        {
            throw new UnauthorizedAccessException("Temporary upload requires authentication.");
        }

        var currentUserId = user.GetKeycloakUserId();
        if (!string.Equals(currentUserId, uploaderUserId, StringComparison.Ordinal))
        {
            throw new UnauthorizedAccessException("Temporary upload is available only to the uploader until activation.");
        }
    }

    private async Task DeleteStoredUploadAsync(SuUpload upload, CancellationToken cancellationToken)
    {
        if (!upload.IsStreaming)
        {
            await DeleteObjectIfExistsAsync(upload.BucketName, upload.ObjectKey, cancellationToken);
            return;
        }

        var separatorIndex = upload.ObjectKey.LastIndexOf('/');
        var prefix = separatorIndex >= 0
            ? upload.ObjectKey[..(separatorIndex + 1)]
            : upload.ObjectKey;

        string? continuationToken = null;
        do
        {
            var listResponse = await s3Client.ListObjectsV2Async(new ListObjectsV2Request
            {
                BucketName = upload.BucketName,
                Prefix = prefix,
                ContinuationToken = continuationToken
            }, cancellationToken);

            if (listResponse.S3Objects.Count > 0)
            {
                await s3Client.DeleteObjectsAsync(new DeleteObjectsRequest
                {
                    BucketName = upload.BucketName,
                    Objects = listResponse.S3Objects
                        .Select(item => new KeyVersion { Key = item.Key })
                        .ToList()
                }, cancellationToken);
            }

            continuationToken = listResponse.IsTruncated == true ? listResponse.NextContinuationToken : null;
        }
        while (!string.IsNullOrWhiteSpace(continuationToken));
    }

    private async Task DeleteObjectIfExistsAsync(string bucketName, string objectKey, CancellationToken cancellationToken)
    {
        try
        {
            await s3Client.DeleteObjectAsync(bucketName, objectKey, cancellationToken);
        }
        catch (AmazonS3Exception ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
            // Ignore missing objects during cleanup.
        }
    }

    private string ResolveBucketName(FileCategory category)
    {
        var options = storageOptions.Value;

        return category switch
        {
            FileCategory.Image => options.ImageBucket,
            FileCategory.Video => options.VideoBucket,
            FileCategory.Document => options.DocumentBucket,
            _ => throw new ArgumentOutOfRangeException(nameof(category), category, null)
        };
    }

    private static string ResolveVideoAssetContentType(string filePath)
    {
        return Path.GetExtension(filePath).ToLowerInvariant() switch
        {
            ".m3u8" => "application/vnd.apple.mpegurl",
            ".ts" => "video/mp2t",
            _ => "application/octet-stream"
        };
    }

    private static void ValidateContentType(IFormFile file, FileCategory category)
    {
        var contentType = file.ContentType?.Trim().ToLowerInvariant();
        var allowedContentTypes = category switch
        {
            FileCategory.Image => ImageContentTypes,
            FileCategory.Video => VideoContentTypes,
            FileCategory.Document => DocumentContentTypes,
            _ => throw new ArgumentOutOfRangeException(nameof(category), category, null)
        };

        if (string.IsNullOrWhiteSpace(contentType) || !allowedContentTypes.Contains(contentType))
        {
            throw new InvalidOperationException(
                $"Content type '{file.ContentType}' is not allowed for {category.ToString().ToLowerInvariant()} uploads.");
        }
    }

    private static string BuildAccessUrl(HttpContext? httpContext, string bucketName, string objectKey)
    {
        if (httpContext is null)
        {
            return $"/api/storage/files/{bucketName}/{objectKey}";
        }

        var encodedSegments = objectKey
            .Split('/', StringSplitOptions.RemoveEmptyEntries)
            .Select(Uri.EscapeDataString);

        return $"{httpContext.Request.Scheme}://{httpContext.Request.Host}/api/storage/files/{Uri.EscapeDataString(bucketName)}/{string.Join('/', encodedSegments)}";
    }

    private static string GetMetadataValue(MetadataCollection metadata, string key)
    {
        if (!metadata.Keys.Contains(key))
        {
            return string.Empty;
        }

        return DecodeMetadataValue(metadata[key]);
    }

    private static FileVisibility ParseVisibility(string value)
    {
        return Enum.TryParse<FileVisibility>(value, true, out var visibility)
            ? visibility
            : FileVisibility.UploaderOnly;
    }

    private static string SanitizeSegment(string value)
    {
        var invalidChars = Path.GetInvalidFileNameChars();
        var chars = value
            .Trim()
            .Select(ch => invalidChars.Contains(ch) || ch == '/' || ch == '\\' ? '-' : ch)
            .ToArray();

        var sanitized = new string(chars).Trim('-');
        return string.IsNullOrWhiteSpace(sanitized) ? "app" : sanitized.ToLowerInvariant();
    }

    private static string EncodeMetadataValue(string? value)
    {
        if (string.IsNullOrEmpty(value))
        {
            return string.Empty;
        }

        return IsAscii(value)
            ? value
            : EncodedMetadataPrefix + Convert.ToBase64String(Encoding.UTF8.GetBytes(value));
    }

    private static string DecodeMetadataValue(string? value)
    {
        if (string.IsNullOrEmpty(value) || !value.StartsWith(EncodedMetadataPrefix, StringComparison.Ordinal))
        {
            return value ?? string.Empty;
        }

        var encodedPayload = value[EncodedMetadataPrefix.Length..];

        try
        {
            return Encoding.UTF8.GetString(Convert.FromBase64String(encodedPayload));
        }
        catch (FormatException)
        {
            return value;
        }
    }

    private static bool IsAscii(string value)
    {
        return value.All(ch => ch is >= ' ' and <= '~');
    }
}
