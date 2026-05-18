namespace sic_api.Middleware;

public class BusinessContextMiddleware(RequestDelegate next, IConfiguration configuration)
{
    public async Task InvokeAsync(HttpContext context)
    {
        var requireBusinessHeader = configuration.GetValue<bool>("App:RequireBusinessHeader");

        var path = context.Request.Path.Value?.ToLowerInvariant() ?? string.Empty;

        var excludedPaths = new[]
        {
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
        };

        var isExcluded = excludedPaths.Any(path.StartsWith);

        if (requireBusinessHeader &&
            context.User.Identity?.IsAuthenticated == true &&
            !isExcluded &&
            context.Request.Method != HttpMethods.Options)
        {
            if (!context.Request.Headers.TryGetValue("X-Business-Id", out var businessId) ||
            string.IsNullOrWhiteSpace(businessId))
            {
                context.Response.StatusCode = StatusCodes.Status400BadRequest;
                await context.Response.WriteAsJsonAsync(new
                {
                    message = "Missing X-Business-Id header."
                });
                return;
            }
        }

        await next(context);
    }
}