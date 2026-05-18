using Microsoft.EntityFrameworkCore;

namespace sic_api.Model.Storage;

public sealed class StorageUploadReference
{
    public EntityState State { get; set; } = EntityState.Detached;
    public Guid Id { get; set; }
    public Guid? UploadGroupId { get; set; }
    public bool IsStreaming { get; set; }
    public bool IsActive { get; set; }
    public string FileName { get; set; } = default!;
    public string ContentType { get; set; } = default!;
    public long FileSize { get; set; }
    public string Visibility { get; set; } = default!;
    public string AccessUrl { get; set; } = default!;
}