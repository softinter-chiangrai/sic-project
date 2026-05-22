using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using sic_api.Features.Auth.Auth;

namespace sic_api.Controllers.Auth;

[Route("api/auth")]
[Authorize]
public class AuthController : BaseController
{
    [HttpGet("me")]
    public async Task<IActionResult> Me(CancellationToken cancellationToken) =>
        Ok(await Mediator.Send(new GetMe.Query { User = User }, cancellationToken));

}
