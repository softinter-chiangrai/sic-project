using sic_api.Extensions;
using sic_api.Services.Interfaces;

namespace sic_api.Services;

public class CurrentUserService(IHttpContextAccessor httpContextAccessor) : ICurrentUserService
{
    public string GetUserId()
    {
        var user = httpContextAccessor.HttpContext?.User
                   ?? throw new UnauthorizedAccessException("No HttpContext user.");
        return user.GetKeycloakUserId();
    }

    public string? GetUsername()
    {
        var user = httpContextAccessor.HttpContext?.User
                   ?? throw new UnauthorizedAccessException("No HttpContext user.");
        return user.GetPreferredUsername();
    }
}