using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using sic_api.Data;

namespace sic_api.Middleware;

/// <summary>
/// Resolves the active business context server-side from the database based on the
/// authenticated user's identity. The client never supplies or influences the business context.
/// Sets HttpContext.Items[BusinessContextKeys.ActiveBusinessId] for all downstream services.
/// </summary>
public class BusinessContextMiddleware(RequestDelegate next)
{
    private static readonly string[] ExcludedPaths =
    [
        "/swagger",
        "/api/auth/",
        "/api/profile/",
        "/api/business/",
        "/api/ex/examples",
        "/api/su/messages",
        "/api/db",
        "/api/i18n",
        "/api/storage",
        "/api/verify"
    ];

    public async Task InvokeAsync(HttpContext context)
    {
        var path = context.Request.Path.Value?.ToLowerInvariant() ?? string.Empty;
        var isExcluded = ExcludedPaths.Any(path.StartsWith);

        if (context.User.Identity?.IsAuthenticated == true &&
            !isExcluded &&
            context.Request.Method != HttpMethods.Options)
        {
            // Resolve userId exclusively from the validated JWT — never from client headers.
            var userId = context.User.FindFirst("sub")?.Value
                         ?? context.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrWhiteSpace(userId))
            {
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                await context.Response.WriteAsJsonAsync(new { message = "Cannot resolve user identity." });
                return;
            }

            var dbContext = context.RequestServices.GetRequiredService<SicDbContext>();

            var sessionId = context.User.FindFirstValue(ClaimTypes.Sid) ?? context.User.FindFirstValue("sid"); 
            var ipAddress = context.Connection.RemoteIpAddress?.ToString();

            if (sessionId is null)
            {
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                await context.Response.WriteAsJsonAsync(new { message = "Cannot resolve session." });
                return;
            }

            if (ipAddress is null)
            {
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                await context.Response.WriteAsJsonAsync(new { message = "Cannot resolve IP address." });
                return;
            }

            // Query the server-authoritative default business for this user.
            // Only the change-business endpoint can alter IsDefault; the client has no influence here.
            Guid? activeBusinessId = await dbContext.SuBusinessAudits
                .Include(x => x.Business)
                .OrderByDescending(x => x.Id)
                .AsNoTracking()
                .Where(x =>
                    x.UserId == userId &&
                    x.SessionId == sessionId &&
                    x.ClientIp == ipAddress &&
                    x.IsActive &&
                    x.Business.IsActive)
                .Select(x => x.Business.Id)
                .FirstOrDefaultAsync(context.RequestAborted);

            if (activeBusinessId is null || activeBusinessId == Guid.Empty)
            {
                context.Response.StatusCode = StatusCodes.Status403Forbidden;
                await context.Response.WriteAsJsonAsync(new
                {
                    message = "No active business context found. Please select a business first."
                });
                return;
            }

            // Store in Items so all downstream code reads a server-resolved, tamper-proof value.
            context.Items[BusinessContextKeys.ActiveBusinessId] = activeBusinessId.Value;
        }

        await next(context);
    }
}