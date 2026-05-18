using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using sic_api.Model.Storage;

namespace sic_api.Services.Interfaces;

public interface IFileStorageService
{
    Task<StorageUploadResult> UploadAsync(
        IFormFile file,
        FileCategory category,
        FileVisibility visibility,
        Guid? uploadGroupId = null,
        HttpContext? httpContext = null,
        CancellationToken cancellationToken = default);

    Task<StorageDownloadResult> DownloadAsync(
        string bucketName,
        string objectKey,
        ClaimsPrincipal? user,
        int? width = null,
        int? height = null,
        CancellationToken cancellationToken = default);

    Task ActivateAsync(
        Guid uploadId,
        ClaimsPrincipal user,
        CancellationToken cancellationToken = default);

    Guid? ResolveUploadGroupId(
        Guid? currentUploadGroupId,
        IReadOnlyCollection<StorageUploadReference> uploadReferences);

    Task SyncUploadsAsync(
        Guid? uploadGroupId,
        IReadOnlyCollection<StorageUploadReference> uploadReferences,
        CancellationToken cancellationToken = default);

    Task DeleteUploadsAsync(
        Guid? entityUploadGroupId,
        IReadOnlyCollection<StorageUploadReference> uploadReferences,
        CancellationToken cancellationToken = default);

    Task DeleteAsync(
        Guid uploadId,
        CancellationToken cancellationToken = default);

    Task DeleteByGroupIdAsync(
        Guid uploadGroupId,
        CancellationToken cancellationToken = default);

    Task CleanupExpiredTemporaryUploadsAsync(CancellationToken cancellationToken = default);
}
