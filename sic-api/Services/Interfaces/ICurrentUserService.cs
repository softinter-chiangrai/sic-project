namespace sic_api.Services.Interfaces;

public interface ICurrentUserService
{
    string GetUserId();
    string GetSessionId();
    string GetIpAddress();
    string? GetUsername();
    Task<string?> GetEmailAsync();
}