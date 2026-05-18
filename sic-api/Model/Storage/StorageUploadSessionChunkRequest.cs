using Microsoft.AspNetCore.Http;

namespace sic_api.Model.Storage;

public class StorageUploadSessionChunkRequest
{
    public IFormFile Chunk { get; set; } = default!;
}