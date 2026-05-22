using System.Security.Claims;

namespace sic_api.Extensions;

public static class ClaimsPrincipalExtensions
{
    public static string GetUserId(this ClaimsPrincipal user)
    {
        return user.FindFirstValue("sub")
               ?? user.FindFirstValue(ClaimTypes.NameIdentifier)
               ?? throw new UnauthorizedAccessException("Missing 'sub' claim.");
    }
    public static string GetSessionId(this ClaimsPrincipal user)
    {
        return user.FindFirstValue(ClaimTypes.Sid) 
               ?? user.FindFirstValue("sid") 
               ?? throw new UnauthorizedAccessException("Missing 'sid' (Session ID) claim.");
    }

    public static string? GetPreferredUsername(this ClaimsPrincipal user)
    {
        return user.FindFirstValue("preferred_username")
               ?? user.FindFirstValue("preferred_username".ToUpperInvariant())
               ?? user.FindFirstValue(ClaimTypes.Name)
               ?? user.Identity?.Name;
    }
}
