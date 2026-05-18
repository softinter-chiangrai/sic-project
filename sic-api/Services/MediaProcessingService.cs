using System.Diagnostics;
using sic_api.Services.Interfaces;

namespace sic_api.Services;

public class MediaProcessingService : IMediaProcessingService
{
    public async Task<ProcessedImageFile> NormalizeImageAsync(IFormFile file, CancellationToken cancellationToken = default)
    {
        if (IsSvgExtension(Path.GetExtension(file.FileName)))
        {
            return await CopySvgAsync(file.OpenReadStream(), cancellationToken);
        }

        var extension = NormalizeImageExtension(Path.GetExtension(file.FileName));
        var inputPath = CreateTempFilePath(Path.GetExtension(file.FileName));
        var outputPath = CreateTempFilePath(extension);

        await using (var stream = file.OpenReadStream())
        await using (var output = File.Create(inputPath))
        {
            await stream.CopyToAsync(output, cancellationToken);
        }

        try
        {
            await RunFfmpegAsync(
                $"-y -i \"{inputPath}\" -vf \"scale='min(1920,iw)':'min(1920,ih)':force_original_aspect_ratio=decrease\" \"{outputPath}\"",
                cancellationToken);

            return new ProcessedImageFile
            {
                FilePath = outputPath,
                Extension = extension,
                ContentType = GetImageContentType(extension)
            };
        }
        finally
        {
            SafeDelete(inputPath);
        }
    }

    public async Task<ProcessedImageFile> ResizeImageAsync(
        Stream input,
        string sourceExtension,
        int? width,
        int? height,
        CancellationToken cancellationToken = default)
    {
        if (IsSvgExtension(sourceExtension))
        {
            return await CopySvgAsync(input, cancellationToken);
        }

        if (width is null && height is null)
        {
            throw new InvalidOperationException("width or height is required for image resize.");
        }

        if (width <= 0 || height <= 0)
        {
            throw new InvalidOperationException("width and height must be greater than zero.");
        }

        if (width > 1920 || height > 1920)
        {
            throw new InvalidOperationException("Image resize supports a maximum of 1920x1920.");
        }

        var extension = NormalizeImageExtension(sourceExtension);
        var inputPath = CreateTempFilePath(extension);
        var outputPath = CreateTempFilePath(extension);

        await using (var output = File.Create(inputPath))
        {
            await input.CopyToAsync(output, cancellationToken);
        }

        var widthValue = width?.ToString() ?? "-1";
        var heightValue = height?.ToString() ?? "-1";

        try
        {
            await RunFfmpegAsync(
                $"-y -i \"{inputPath}\" -vf \"scale={widthValue}:{heightValue}:force_original_aspect_ratio=decrease\" \"{outputPath}\"",
                cancellationToken);

            return new ProcessedImageFile
            {
                FilePath = outputPath,
                Extension = extension,
                ContentType = GetImageContentType(extension)
            };
        }
        finally
        {
            SafeDelete(inputPath);
        }
    }

    public async Task<ProcessedVideoPackage> ConvertVideoToHlsAsync(IFormFile file, CancellationToken cancellationToken = default)
    {
        var tempRoot = Path.Combine(Path.GetTempPath(), "sic-api-media", Guid.NewGuid().ToString("N"));
        Directory.CreateDirectory(tempRoot);

        var inputPath = Path.Combine(tempRoot, $"input{Path.GetExtension(file.FileName)}");
        var playlistPath = Path.Combine(tempRoot, "index.m3u8");
        var segmentPattern = Path.Combine(tempRoot, "segment_%03d.ts");

        await using (var stream = file.OpenReadStream())
        await using (var output = File.Create(inputPath))
        {
            await stream.CopyToAsync(output, cancellationToken);
        }

        try
        {
            await RunFfmpegAsync(
                $"-y -i \"{inputPath}\" -vf \"scale='min(1280,iw)':'min(720,ih)':force_original_aspect_ratio=decrease:force_divisible_by=2\" -c:v libx264 -preset veryfast -crf 23 -c:a aac -ar 48000 -b:a 128k -hls_time 6 -hls_playlist_type vod -hls_segment_filename \"{segmentPattern}\" \"{playlistPath}\"",
                cancellationToken);

            SafeDelete(inputPath);

            return new ProcessedVideoPackage
            {
                DirectoryPath = tempRoot,
                PlaylistFileName = "index.m3u8"
            };
        }
        catch
        {
            SafeDelete(inputPath);
            SafeDeleteDirectory(tempRoot);
            throw;
        }
    }

    private static async Task RunFfmpegAsync(string arguments, CancellationToken cancellationToken)
    {
        var startInfo = new ProcessStartInfo
        {
            FileName = "ffmpeg",
            Arguments = arguments,
            RedirectStandardError = true,
            RedirectStandardOutput = true,
            UseShellExecute = false,
            CreateNoWindow = true
        };

        using var process = new Process { StartInfo = startInfo };
        process.Start();

        var stdOutTask = process.StandardOutput.ReadToEndAsync(cancellationToken);
        var stdErrTask = process.StandardError.ReadToEndAsync(cancellationToken);

        await process.WaitForExitAsync(cancellationToken);

        var stdErr = await stdErrTask;
        await stdOutTask;

        if (process.ExitCode != 0)
        {
            throw new InvalidOperationException($"ffmpeg failed: {stdErr}");
        }
    }

    private static string CreateTempFilePath(string extension)
    {
        var tempRoot = Path.Combine(Path.GetTempPath(), "sic-api-media");
        Directory.CreateDirectory(tempRoot);
        return Path.Combine(tempRoot, $"{Guid.NewGuid():N}{extension}");
    }

    private static string NormalizeImageExtension(string extension)
    {
        return extension.Trim().ToLowerInvariant() switch
        {
            ".svg" => ".svg",
            ".jpg" => ".jpg",
            ".jpeg" => ".jpg",
            ".png" => ".png",
            ".webp" => ".webp",
            ".bmp" => ".bmp",
            ".gif" => ".gif",
            _ => ".jpg"
        };
    }

    private static string GetImageContentType(string extension)
    {
        return extension.ToLowerInvariant() switch
        {
            ".svg" => "image/svg+xml",
            ".png" => "image/png",
            ".webp" => "image/webp",
            ".bmp" => "image/bmp",
            ".gif" => "image/gif",
            _ => "image/jpeg"
        };
    }

    private static bool IsSvgExtension(string extension)
    {
        return string.Equals(extension?.Trim(), ".svg", StringComparison.OrdinalIgnoreCase);
    }

    private static async Task<ProcessedImageFile> CopySvgAsync(Stream input, CancellationToken cancellationToken)
    {
        var outputPath = CreateTempFilePath(".svg");

        await using (var output = File.Create(outputPath))
        {
            await input.CopyToAsync(output, cancellationToken);
        }

        return new ProcessedImageFile
        {
            FilePath = outputPath,
            Extension = ".svg",
            ContentType = "image/svg+xml"
        };
    }

    private static void SafeDelete(string path)
    {
        if (File.Exists(path))
        {
            File.Delete(path);
        }
    }

    private static void SafeDeleteDirectory(string path)
    {
        if (Directory.Exists(path))
        {
            Directory.Delete(path, true);
        }
    }
}
