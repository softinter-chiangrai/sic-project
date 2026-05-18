using Microsoft.AspNetCore.Http;

namespace sic_api.Model.Storage;

public class StorageUploadRequest
{
    public IFormFile File { get; set; } = default!;
    public FileVisibility Visibility { get; set; } = FileVisibility.UploaderOnly;
    public Guid? UploadGroupId { get; set; }
}
