using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using sic_api.Controllers;
using sic_api.Extensions;
using sic_api.Features.Auth;

namespace sic_api.Controllers.Auth;

[Route("api/auth")]
[Authorize]
public class AuthController : BaseController
{
    [HttpGet("me")]
    public async Task<IActionResult> Me(CancellationToken cancellationToken) =>
        Ok(await Mediator.Send(new GetMe.Query { User = User }, cancellationToken));

    [HttpGet("profile")]
    public async Task<IActionResult> Profile(CancellationToken cancellationToken) =>
        Ok(await Mediator.Send(new GetProfile.Query { User = User }, cancellationToken));
        
    [HttpGet("is-profile-complete")]
    public async Task<IActionResult> IsProfileComplete(CancellationToken cancellationToken) =>
        Ok(await Mediator.Send(new IsProfileComplete.Query { User = User }, cancellationToken));

    [HttpGet("my-business")]
    public async Task<IActionResult> MyCompanies(CancellationToken cancellationToken) =>
        Ok(await Mediator.Send(new GetMyCompanies.Query(), cancellationToken));

    [HttpGet("is-business-complete")]
    public async Task<IActionResult> IsBusinessComplete(CancellationToken cancellationToken) =>
        Ok(await Mediator.Send(new IsBusinessComplete.Query { User = User }, cancellationToken));

    [HttpPost("change-business")]
    public async Task<IActionResult> ChangeBusiness(
        [FromBody] ChangeBusiness.Command model,
        CancellationToken cancellationToken)
    {
        model.ClientIp = HttpContext.Connection.RemoteIpAddress?.ToString();
        return Ok(await Mediator.Send(model, cancellationToken));
    }

    [HttpGet("business-access")]
    public async Task<IActionResult> CurrentAccess(CancellationToken cancellationToken) =>
        Ok(await Mediator.Send(new GetBusinessAccess.Query(), cancellationToken));
}
