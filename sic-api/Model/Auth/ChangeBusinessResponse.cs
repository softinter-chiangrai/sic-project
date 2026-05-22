namespace sic_api.Model.Auth;

public class ChangeBusinessResponse
{
    public string UserId { get; set; } = default!;
    public string? Username { get; set; }
    public Guid BusinessId { get; set; } = default!;
    public string BusinessName { get; set; } = default!;
    public bool Changed { get; set; }
}