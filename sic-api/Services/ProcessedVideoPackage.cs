namespace sic_api.Services;

public class ProcessedVideoPackage : IDisposable
{
    public string DirectoryPath { get; set; } = default!;
    public string PlaylistFileName { get; set; } = "index.m3u8";

    public IEnumerable<string> GetFiles()
    {
        return Directory.EnumerateFiles(DirectoryPath, "*", SearchOption.TopDirectoryOnly);
    }

    public void Dispose()
    {
        if (!string.IsNullOrWhiteSpace(DirectoryPath) && Directory.Exists(DirectoryPath))
        {
            Directory.Delete(DirectoryPath, true);
        }
    }
}
