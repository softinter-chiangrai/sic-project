namespace sic_api.Services;

public class StorageOptions
{
    public const string SectionName = "Storage";

    public string ServiceUrl { get; set; } = default!;
    public string AccessKey { get; set; } = default!;
    public string SecretKey { get; set; } = default!;
    public string ImageBucket { get; set; } = "public-files";
    public string VideoBucket { get; set; } = "public-files";
    public string DocumentBucket { get; set; } = "documents";
}
