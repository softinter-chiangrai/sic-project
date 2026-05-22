using sic_api.Attributes;
using sic_api.Model.Storage;

namespace sic_api.Model.Business;

public class BusinessDto
{
    public Guid Id { get; set; }
    public string Code { get; set; } = default!;
    public string Name { get; set; } = default!;
    public bool IsDefault { get; set; }

    [Storage("UploadGroupData")]
    public Guid? UploadGroupId { get; set; } = null;

    public List<StorageUploadReference> UploadGroupData { get; set; } = [];
}