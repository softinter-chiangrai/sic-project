using Amazon.S3;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using sic_api.Services.Interfaces;
using System.Net;
using System.Security.Claims;

namespace sic_api.Features.Storage;

public static class DownloadStorageFile
{
    public class Query : IRequest<IActionResult>
    {
        public string BucketName { get; set; } = default!;
        public string ObjectKey { get; set; } = default!;
        public int? Width { get; set; }
        public int? Height { get; set; }
        public ClaimsPrincipal? User { get; set; }
    }

    public sealed class Handler(IFileStorageService fileStorageService) : IRequestHandler<Query, IActionResult>
    {
        public async Task<IActionResult> Handle(Query request, CancellationToken cancellationToken)
        {
            try
            {
                var result = await fileStorageService.DownloadAsync(
                    request.BucketName,
                    request.ObjectKey,
                    request.User,
                    request.Width,
                    request.Height,
                    cancellationToken);

                return new FileStreamResult(result.Content, result.ContentType)
                {
                    EnableRangeProcessing = true,
                    FileDownloadName = result.FileName
                };
            }
            catch (UnauthorizedAccessException)
            {
                return request.User?.Identity?.IsAuthenticated == true
                    ? new ForbidResult()
                    : new UnauthorizedResult();
            }
            catch (AmazonS3Exception ex) when (ex.StatusCode == HttpStatusCode.NotFound)
            {
                return new NotFoundResult();
            }
            catch (AmazonS3Exception ex) when (ex.StatusCode == HttpStatusCode.Forbidden)
            {
                return new ForbidResult();
            }
            catch (InvalidOperationException ex)
            {
                return new BadRequestObjectResult(new { message = ex.Message });
            }
        }
    }
}
