namespace sic_api.Attributes;

[AttributeUsage(AttributeTargets.Property, AllowMultiple = false, Inherited = true)]
public sealed class StorageAttribute : Attribute
{
    public StorageAttribute(string responseFieldName)
    {
        if (string.IsNullOrWhiteSpace(responseFieldName))
        {
            throw new ArgumentException("Response field name is required.", nameof(responseFieldName));
        }

        ResponseFieldName = responseFieldName;
    }

    public string ResponseFieldName { get; }
}