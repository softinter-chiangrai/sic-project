using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using sic_api.Controllers;
using sic_api.Features.Storage;
using sic_api.Model.Storage;
using sic_api.Services.Interfaces;

namespace sic_api.Controllers.Storage;

[Route("api/storage")]
public class StorageController(
    IResumableUploadService resumableUploadService,
    IFileStorageService fileStorageService) : BaseController
{
    [Authorize]
    [HttpPost("upload/image")]
    [RequestSizeLimit(200_000_000)]
    public async Task<IActionResult> UploadImage([FromForm] StorageUploadRequest request, CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(new UploadStorageFile.Command
        {
            File = request.File,
            Visibility = request.Visibility,
            UploadGroupId = request.UploadGroupId,
            Category = FileCategory.Image,
            HttpContext = HttpContext
        }, cancellationToken);
        return Ok(new { id = result.Id, accessUrl = result.AccessUrl, fileName = result.FileName, fileSize = result.FileSize, contentType = result.ContentType });
    }

    [Authorize]
    [HttpPost("upload/video")]
    [RequestSizeLimit(1_000_000_000)]
    public async Task<IActionResult> UploadVideo([FromForm] StorageUploadRequest request, CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(new UploadStorageFile.Command
        {
            File = request.File,
            Visibility = request.Visibility,
            UploadGroupId = request.UploadGroupId,
            Category = FileCategory.Video,
            HttpContext = HttpContext
        }, cancellationToken);
        return Ok(new { id = result.Id, accessUrl = result.AccessUrl, fileName = result.FileName, fileSize = result.FileSize, contentType = result.ContentType });
    }

    [Authorize]
    [HttpPost("upload/document")]
    [RequestSizeLimit(200_000_000)]
    public async Task<IActionResult> UploadDocument([FromForm] StorageUploadRequest request, CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(new UploadStorageFile.Command
        {
            File = request.File,
            Visibility = request.Visibility,
            UploadGroupId = request.UploadGroupId,
            Category = FileCategory.Document,
            HttpContext = HttpContext
        }, cancellationToken);
        return Ok(new { id = result.Id, accessUrl = result.AccessUrl, fileName = result.FileName, fileSize = result.FileSize, contentType = result.ContentType });
    }

    [Authorize]
    [HttpPost("upload/sessions")]
    public async Task<IActionResult> CreateUploadSession(
        [FromBody] StorageUploadSessionCreateRequest request,
        CancellationToken cancellationToken) =>
        Ok(await resumableUploadService.CreateSessionAsync(request, cancellationToken));

    [Authorize]
    [HttpGet("upload/sessions/{sessionId:guid}")]
    public async Task<IActionResult> GetUploadSessionStatus(
        Guid sessionId,
        CancellationToken cancellationToken) =>
        Ok(await resumableUploadService.GetSessionStatusAsync(sessionId, cancellationToken));

    [Authorize]
    [HttpPost("upload/sessions/{sessionId:guid}/chunks/{chunkIndex:int}")]
    [RequestSizeLimit(100_000_000)]
    public async Task<IActionResult> UploadChunk(
        Guid sessionId,
        int chunkIndex,
        [FromForm] StorageUploadSessionChunkRequest request,
        CancellationToken cancellationToken) =>
        Ok(await resumableUploadService.UploadChunkAsync(sessionId, chunkIndex, request.Chunk, cancellationToken));

    [Authorize]
    [HttpPost("upload/sessions/{sessionId:guid}/complete")]
    public async Task<IActionResult> CompleteUploadSession(
        Guid sessionId,
        CancellationToken cancellationToken) =>
        Ok(await resumableUploadService.CompleteSessionAsync(sessionId, HttpContext, cancellationToken));

    [Authorize]
    [HttpDelete("upload/sessions/{sessionId:guid}")]
    public async Task<IActionResult> CancelUploadSession(
        Guid sessionId,
        CancellationToken cancellationToken)
    {
        await resumableUploadService.CancelSessionAsync(sessionId, cancellationToken);
        return NoContent();
    }

    [Authorize]
    [HttpPost("uploads/{uploadId:guid}/activate")]
    public async Task<IActionResult> ActivateUpload(
        Guid uploadId,
        CancellationToken cancellationToken)
    {
        await fileStorageService.ActivateAsync(uploadId, User, cancellationToken);
        return NoContent();
    }

    [AllowAnonymous]
    [HttpGet("files/{bucketName}/{**objectKey}")]
    public async Task<IActionResult> DownloadFile(
        string bucketName,
        string objectKey,
        [FromQuery] int? width,
        [FromQuery] int? height,
        CancellationToken cancellationToken)
        => await Mediator.Send(new DownloadStorageFile.Query
        {
            BucketName = bucketName,
            ObjectKey = objectKey,
            Width = width,
            Height = height,
            User = User
        }, cancellationToken);
}
