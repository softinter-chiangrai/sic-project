namespace sic_api.Services;

public class ProcessedImageFile : IDisposable
{
    public string FilePath { get; set; } = default!;
    public string ContentType { get; set; } = default!;
    public string Extension { get; set; } = default!;

    public void Dispose()
    {
        if (!string.IsNullOrWhiteSpace(FilePath) && File.Exists(FilePath))
        {
            File.Delete(FilePath);
        }
    }
}
