using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using sic_api.Features.Auth.Menu;

namespace sic_api.Controllers.Auth;

[Authorize]
[Route("api/menu")]
public class MenuController : BaseController
{
    [HttpGet]
    public async Task<IActionResult> GetMenu([FromQuery] GetMenu.Query model, CancellationToken cancellationToken) =>
        Ok(await Mediator.Send(model, cancellationToken));
}