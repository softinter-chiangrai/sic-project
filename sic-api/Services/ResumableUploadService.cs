using System.Collections.Concurrent;
using System.Text.Json;
using Microsoft.AspNetCore.Http;
using sic_api.Model.Storage;
using sic_api.Services.Interfaces;

namespace sic_api.Services;

public class ResumableUploadService(
    IFileStorageService fileStorageService,
    IWebHostEnvironment hostEnvironment) : IResumableUploadService
{
    private static readonly ConcurrentDictionary<Guid, SemaphoreSlim> SessionLocks = new();
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    public async Task<StorageUploadSessionState> CreateSessionAsync(
        StorageUploadSessionCreateRequest request,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.FileName))
        {
            throw new InvalidOperationException("FileName is required.");
        }

        if (request.FileSize <= 0)
        {
            throw new InvalidOperationException("FileSize must be greater than zero.");
        }

        if (string.IsNullOrWhiteSpace(request.ContentType))
        {
            throw new InvalidOperationException("ContentType is required.");
        }

        if (request.ChunkSize <= 0)
        {
            throw new InvalidOperationException("ChunkSize must be greater than zero.");
        }

        var sessionId = Guid.CreateVersion7();
        var totalChunks = (int)Math.Ceiling(request.FileSize / (double)request.ChunkSize);
        var state = new ResumableUploadSessionStateFile
        {
            SessionId = sessionId,
            FileName = request.FileName,
            FileSize = request.FileSize,
            ContentType = request.ContentType,
            Category = request.Category,
            Visibility = request.Visibility,
            UploadGroupId = request.UploadGroupId,
            ChunkSize = request.ChunkSize,
            TotalChunks = Math.Max(totalChunks, 1),
            NextChunkIndex = 0,
            UploadedBytes = 0,
            IsCompleted = false
        };

        Directory.CreateDirectory(GetSessionDirectory(sessionId));
        await SaveStateAsync(state, cancellationToken);
        await using var dataStream = new FileStream(GetDataFilePath(sessionId), FileMode.Create, FileAccess.Write, FileShare.None);
        await dataStream.FlushAsync(cancellationToken);

        return MapState(state);
    }

    public async Task<StorageUploadSessionState> GetSessionStatusAsync(
        Guid sessionId,
        CancellationToken cancellationToken = default)
    {
        var state = await LoadStateAsync(sessionId, cancellationToken);
        return MapState(state);
    }

    public async Task<StorageUploadSessionState> UploadChunkAsync(
        Guid sessionId,
        int chunkIndex,
        IFormFile chunk,
        CancellationToken cancellationToken = default)
    {
        if (chunk.Length <= 0)
        {
            throw new InvalidOperationException("Chunk is empty.");
        }

        var sessionLock = SessionLocks.GetOrAdd(sessionId, _ => new SemaphoreSlim(1, 1));
        await sessionLock.WaitAsync(cancellationToken);
        try
        {
            var state = await LoadStateAsync(sessionId, cancellationToken);
            if (state.IsCompleted)
            {
                throw new InvalidOperationException("Upload session is already completed.");
            }

            if (chunkIndex < state.NextChunkIndex)
            {
                return MapState(state);
            }

            if (chunkIndex > state.NextChunkIndex)
            {
                throw new InvalidOperationException($"Chunk out of order. Expected chunk index {state.NextChunkIndex}.");
            }

            await using (var target = new FileStream(GetDataFilePath(sessionId), FileMode.Append, FileAccess.Write, FileShare.None))
            await using (var source = chunk.OpenReadStream())
            {
                await source.CopyToAsync(target, cancellationToken);
            }

            state.NextChunkIndex += 1;
            state.UploadedBytes = Math.Min(state.FileSize, state.UploadedBytes + chunk.Length);
            await SaveStateAsync(state, cancellationToken);

            return MapState(state);
        }
        finally
        {
            sessionLock.Release();
        }
    }

    public async Task<StorageUploadResult> CompleteSessionAsync(
        Guid sessionId,
        HttpContext? httpContext = null,
        CancellationToken cancellationToken = default)
    {
        var sessionLock = SessionLocks.GetOrAdd(sessionId, _ => new SemaphoreSlim(1, 1));
        var shouldRemoveSessionLock = false;
        await sessionLock.WaitAsync(cancellationToken);
        try
        {
            var state = await LoadStateAsync(sessionId, cancellationToken);
            if (state.IsCompleted)
            {
                throw new InvalidOperationException("Upload session is already completed.");
            }

            if (state.NextChunkIndex < state.TotalChunks)
            {
                throw new InvalidOperationException("Upload is not complete yet.");
            }

            var dataFilePath = GetDataFilePath(sessionId);
            var fileInfo = new FileInfo(dataFilePath);
            if (!fileInfo.Exists || fileInfo.Length <= 0)
            {
                throw new InvalidOperationException("Upload session data file was not found.");
            }

            StorageUploadResult result;
            await using (var stream = new FileStream(dataFilePath, FileMode.Open, FileAccess.Read, FileShare.Read))
            {
                var formFile = new FormFile(stream, 0, stream.Length, "file", state.FileName)
                {
                    Headers = new HeaderDictionary(),
                    ContentType = state.ContentType
                };

                result = await fileStorageService.UploadAsync(
                    formFile,
                    state.Category,
                    state.Visibility,
                    state.UploadGroupId,
                    httpContext,
                    cancellationToken);
            }

            await CleanupSessionFilesAsync(sessionId, cancellationToken);
            shouldRemoveSessionLock = true;
            return result;
        }
        finally
        {
            sessionLock.Release();
            if (shouldRemoveSessionLock)
            {
                RemoveSessionLock(sessionId, sessionLock);
            }
        }
    }

    public async Task CancelSessionAsync(
        Guid sessionId,
        CancellationToken cancellationToken = default)
    {
        var sessionLock = SessionLocks.GetOrAdd(sessionId, _ => new SemaphoreSlim(1, 1));
        var shouldRemoveSessionLock = false;
        await sessionLock.WaitAsync(cancellationToken);
        try
        {
            await CleanupSessionFilesAsync(sessionId, cancellationToken);
            shouldRemoveSessionLock = true;
        }
        finally
        {
            sessionLock.Release();
            if (shouldRemoveSessionLock)
            {
                RemoveSessionLock(sessionId, sessionLock);
            }
        }
    }

    private async Task<ResumableUploadSessionStateFile> LoadStateAsync(Guid sessionId, CancellationToken cancellationToken)
    {
        var statePath = GetStateFilePath(sessionId);
        if (!File.Exists(statePath))
        {
            throw new FileNotFoundException("Upload session was not found.", statePath);
        }

        await using var stream = new FileStream(statePath, FileMode.Open, FileAccess.Read, FileShare.Read);
        var state = await JsonSerializer.DeserializeAsync<ResumableUploadSessionStateFile>(stream, JsonOptions, cancellationToken);
        return state ?? throw new InvalidOperationException("Upload session state is invalid.");
    }

    private async Task SaveStateAsync(ResumableUploadSessionStateFile state, CancellationToken cancellationToken)
    {
        var statePath = GetStateFilePath(state.SessionId);
        await using var stream = new FileStream(statePath, FileMode.Create, FileAccess.Write, FileShare.None);
        await JsonSerializer.SerializeAsync(stream, state, JsonOptions, cancellationToken);
    }

    private StorageUploadSessionState MapState(ResumableUploadSessionStateFile state)
    {
        return new StorageUploadSessionState
        {
            SessionId = state.SessionId,
            FileName = state.FileName,
            FileSize = state.FileSize,
            ContentType = state.ContentType,
            Category = state.Category,
            Visibility = state.Visibility,
            UploadGroupId = state.UploadGroupId,
            ChunkSize = state.ChunkSize,
            TotalChunks = state.TotalChunks,
            NextChunkIndex = state.NextChunkIndex,
            UploadedBytes = state.UploadedBytes,
            IsCompleted = state.IsCompleted
        };
    }

    private string GetRootDirectory()
    {
        return Path.Combine(hostEnvironment.ContentRootPath, "App_Data", "UploadSessions");
    }

    private string GetSessionDirectory(Guid sessionId)
    {
        return Path.Combine(GetRootDirectory(), sessionId.ToString("N"));
    }

    private string GetStateFilePath(Guid sessionId)
    {
        return Path.Combine(GetSessionDirectory(sessionId), "session.json");
    }

    private string GetDataFilePath(Guid sessionId)
    {
        return Path.Combine(GetSessionDirectory(sessionId), "upload.part");
    }

    private async Task CleanupSessionFilesAsync(Guid sessionId, CancellationToken cancellationToken)
    {
        var sessionDirectory = GetSessionDirectory(sessionId);
        if (Directory.Exists(sessionDirectory))
        {
            const int maxAttempts = 3;

            for (var attempt = 1; attempt <= maxAttempts; attempt += 1)
            {
                try
                {
                    Directory.Delete(sessionDirectory, true);
                    break;
                }
                catch (IOException) when (attempt < maxAttempts)
                {
                    await Task.Delay(50 * attempt, cancellationToken);
                }
                catch (UnauthorizedAccessException) when (attempt < maxAttempts)
                {
                    await Task.Delay(50 * attempt, cancellationToken);
                }
            }
        }

        SessionLocks.TryGetValue(sessionId, out _);
    }

    private static void RemoveSessionLock(Guid sessionId, SemaphoreSlim sessionLock)
    {
        if (SessionLocks.TryGetValue(sessionId, out var existingLock) && ReferenceEquals(existingLock, sessionLock))
        {
            SessionLocks.TryRemove(sessionId, out _);
            sessionLock.Dispose();
        }
    }

    private sealed class ResumableUploadSessionStateFile
    {
        public Guid SessionId { get; set; }
        public string FileName { get; set; } = default!;
        public long FileSize { get; set; }
        public string ContentType { get; set; } = default!;
        public FileCategory Category { get; set; }
        public FileVisibility Visibility { get; set; }
        public Guid? UploadGroupId { get; set; }
        public int ChunkSize { get; set; }
        public int TotalChunks { get; set; }
        public int NextChunkIndex { get; set; }
        public long UploadedBytes { get; set; }
        public bool IsCompleted { get; set; }
    }
}