namespace sic_api.Model.Business;

public class BusinessDto
{
    public Guid BusinessId { get; set; } = default!;
    public string BusinessName { get; set; } = default!;
    public bool IsDefault { get; set; }
}