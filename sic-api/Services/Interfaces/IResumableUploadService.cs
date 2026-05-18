using Microsoft.AspNetCore.Http;
using sic_api.Model.Storage;

namespace sic_api.Services.Interfaces;

public interface IResumableUploadService
{
    Task<StorageUploadSessionState> CreateSessionAsync(
        StorageUploadSessionCreateRequest request,
        CancellationToken cancellationToken = default);

    Task<StorageUploadSessionState> GetSessionStatusAsync(
        Guid sessionId,
        CancellationToken cancellationToken = default);

    Task<StorageUploadSessionState> UploadChunkAsync(
        Guid sessionId,
        int chunkIndex,
        IFormFile chunk,
        CancellationToken cancellationToken = default);

    Task<StorageUploadResult> CompleteSessionAsync(
        Guid sessionId,
        HttpContext? httpContext = null,
        CancellationToken cancellationToken = default);

    Task CancelSessionAsync(
        Guid sessionId,
        CancellationToken cancellationToken = default);
}