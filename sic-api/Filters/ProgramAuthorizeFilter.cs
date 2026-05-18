using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using sic_api.Services.Interfaces;

namespace sic_api.Filters;

public class ProgramAuthorizeFilter(
    string programCode,
    IProgramAccessService programAccessService) : IAsyncAuthorizationFilter
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

        var canAccess = await programAccessService.CanAccessProgramAsync(
            programCode,
            context.HttpContext.RequestAborted);

        if (!canAccess)
        {
            context.Result = new ForbidResult();
        }
    }
}
