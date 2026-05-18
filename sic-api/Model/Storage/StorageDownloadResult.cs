namespace sic_api.Model.Storage;

public class StorageDownloadResult
{
    public Stream Content { get; set; } = default!;
    public string ContentType { get; set; } = default!;
    public string FileName { get; set; } = default!;
}
