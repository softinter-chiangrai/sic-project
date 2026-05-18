namespace sic_api.Model.Storage;

public class StorageUploadSessionState
{
    public Guid SessionId { get; set; }
    public string FileName { get; set; } = default!;
    public long FileSize { get; set; }
    public string ContentType { get; set; } = default!;
    public FileCategory Category { get; set; }
    public FileVisibility Visibility { get; set; } = FileVisibility.UploaderOnly;
    public Guid? UploadGroupId { get; set; }
    public int ChunkSize { get; set; }
    public int TotalChunks { get; set; }
    public int NextChunkIndex { get; set; }
    public long UploadedBytes { get; set; }
    public bool IsCompleted { get; set; }
}