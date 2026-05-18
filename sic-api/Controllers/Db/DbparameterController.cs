using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using sic_api.Features.Db.Parameter;

namespace sic_api.Controllers.Db;

[Route("api/db/parameter")]
// [Authorize]
// [ProgramAuthorize("DB_PARAMETER")]
public class DbParameterController : BaseController
{
    [HttpGet("lov")]
    public async Task<IActionResult> Lov(CancellationToken cancellationToken) =>
        Ok(await Mediator.Send(new GetDbParameterLov.Query(), cancellationToken));
}
