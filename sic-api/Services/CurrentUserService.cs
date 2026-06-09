using Microsoft.EntityFrameworkCore;
using sic_api.Data;
using sic_api.Extensions;
using sic_api.Services.Interfaces;

namespace sic_api.Services;

public class CurrentUserService(IHttpContextAccessor httpContextAccessor, SicDbContext db) : ICurrentUserService
{
    public string GetUserId()
    {
        var user = httpContextAccessor.HttpContext?.User
                   ?? throw new UnauthorizedAccessException("No HttpContext user.");
        return user.GetUserId();
    }

    public string GetSessionId()
    {
        var sessionId = httpContextAccessor.HttpContext?.User.GetSessionId()
                        ?? throw new UnauthorizedAccessException("No HttpContext session.");
        return sessionId;
    }
    public string GetIpAddress()
    {
        var ipAddress = httpContextAccessor.HttpContext?.Connection.RemoteIpAddress?.ToString()
                        ?? throw new UnauthorizedAccessException("No HttpContext IP address.");
        return ipAddress;
    }
    

    public string? GetUsername()
    {
        var user = httpContextAccessor.HttpContext?.User
                   ?? throw new UnauthorizedAccessException("No HttpContext user.");
        return user.GetPreferredUsername();
    }

    public async Task<string?> GetEmailAsync()
    {
        var userId = httpContextAccessor.HttpContext?.User.GetUserId();
        if (userId is null) return null;
        var profile = await db.SuProfiles
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.UserId == userId);
        return profile?.Email;
    }
}