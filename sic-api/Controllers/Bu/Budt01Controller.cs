using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using sic_api.Features.Bu.Budt01;
using sic_api.Filters;

namespace sic_api.Controllers.Bu;

[Authorize]
[Route("api/bu/budt01")]
[ProgramAuthorize("BUDT1001")]
public class Budt01Controller : BaseController
{
    [HttpGet]
    public async Task<IActionResult> BusinessRole([FromQuery] GetBusinessRole.Query model, CancellationToken cancellationToken) =>
        Ok(await Mediator.Send(model, cancellationToken));
}