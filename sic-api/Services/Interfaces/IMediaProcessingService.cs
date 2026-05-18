namespace sic_api.Services.Interfaces;

public interface IMediaProcessingService
{
    Task<ProcessedImageFile> NormalizeImageAsync(IFormFile file, CancellationToken cancellationToken = default);
    Task<ProcessedImageFile> ResizeImageAsync(Stream input, string sourceExtension, int? width, int? height, CancellationToken cancellationToken = default);
    Task<ProcessedVideoPackage> ConvertVideoToHlsAsync(IFormFile file, CancellationToken cancellationToken = default);
}
