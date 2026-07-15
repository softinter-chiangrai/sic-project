using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using sic_api.Services.Interfaces;

namespace sic_api.Filters;

public static class ProgramScopes
{
    public const string Back = "BACK";
    public const string Search = "SEARCH";
    public const string Add = "ADD";
    public const string Save = "save";
    public const string Remove = "REMOVE";
    public const string Print = "PRINT";
}

public sealed class ScopeAuthorizeFilter(
    string[] scopes,
    IProgramAccessService programAccessService,
    ILogger<ScopeAuthorizeFilter> logger) : IAsyncAuthorizationFilter
{
    public async Task OnAuthorizationAsync(AuthorizationFilterContext context)
    {
        var endpoint = context.HttpContext.GetEndpoint();
        if (endpoint?.Metadata.GetMetadata<IAllowAnonymous>() is not null)
        {
            return;
        }

        if (context.HttpContext.User.Identity?.IsAuthenticated != true)
        {
            context.Result = new UnauthorizedResult();
            return;
        }

        var programCode = GetProgramCode(context);
        if (string.IsNullOrWhiteSpace(programCode))
        {
            logger.LogWarning(
                "ProgramAuthorizeAttribute not found. Path={Path} CorrelationId={CorrelationId}",
                context.HttpContext.Request.Path,
                context.HttpContext.TraceIdentifier);

            context.Result = new ForbidResult();
            return;
        }

        var requiredScopes = NormalizeScopes(scopes);
        if (requiredScopes.Length == 0)
        {
            return;
        }

        var hasAnyScope = await HasAnyScopeAsync(
            programCode,
            requiredScopes,
            context.HttpContext.RequestAborted);

        if (!hasAnyScope)
        {
            logger.LogWarning(
                "Scope access denied. ProgramCode={ProgramCode} Scopes={Scopes} CorrelationId={CorrelationId}",
                programCode,
                string.Join(",", requiredScopes),
                context.HttpContext.TraceIdentifier);

            context.Result = new ForbidResult();
            return;
        }
    }

    private async Task<bool> HasAnyScopeAsync(
        string programCode,
        IReadOnlyCollection<string> requiredScopes,
        CancellationToken cancellationToken)
    {
        foreach (var scope in requiredScopes)
        {
            var canAccess = await programAccessService.CanAccessProgramScopeAsync(
                programCode,
                scope,
                cancellationToken);

            if (canAccess)
            {
                return true;
            }
        }

        return false;
    }

    private static string? GetProgramCode(AuthorizationFilterContext context)
    {
        return context.ActionDescriptor.EndpointMetadata
            .OfType<ProgramAuthorizeAttribute>()
            .LastOrDefault()
            ?.ProgramCode;
    }

    private static string[] NormalizeScopes(IEnumerable<string>? sourceScopes)
    {
        return sourceScopes?
            .Where(scope => !string.IsNullOrWhiteSpace(scope))
            .Select(scope => scope.Trim())
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray() ?? [];
    }
}