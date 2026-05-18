namespace sic_api.Model.Storage;

public class StorageUploadSessionCreateRequest
{
    public string FileName { get; set; } = default!;
    public long FileSize { get; set; }
    public string ContentType { get; set; } = default!;
    public FileCategory Category { get; set; }
    public FileVisibility Visibility { get; set; } = FileVisibility.UploaderOnly;
    public Guid? UploadGroupId { get; set; }
    public int ChunkSize { get; set; } = 5 * 1024 * 1024;
}