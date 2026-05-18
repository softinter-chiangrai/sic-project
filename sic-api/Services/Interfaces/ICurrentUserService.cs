namespace sic_api.Services.Interfaces;

public interface ICurrentUserService
{
    string GetUserId();
    string? GetUsername();
}