using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using sic_api.Features.Marketplace.Mprt03;

namespace sic_api.Controllers.Mprt;

[Route("api/mprt03")]
[Authorize]
public class Mprt03Controller : BaseController
{
    [HttpGet("{programCode}")]
    public async Task<IActionResult> Search(
        [FromRoute] string programCode,
        [FromQuery] GetMprt03Grid.Query model,
        CancellationToken cancellationToken)
    {
        model.ProgramCode = programCode;

        return Ok(await Mediator.Send(model, cancellationToken));
    }

    [HttpPost("{programCode}/save")]
    public async Task<IActionResult> Save(
        [FromRoute] string programCode,
        [FromBody] List<SaveMprt03Grid.RowModel> rows,
        CancellationToken cancellationToken)
    {
        return Ok(await Mediator.Send(new SaveMprt03Grid.Command
        {
            ProgramCode = programCode,
            Rows = rows
        }, cancellationToken));
    }

    [HttpGet("{referenceEntity}/options")]
    public async Task<IActionResult> Options(
        [FromRoute] string referenceEntity,
        [FromQuery] GetMprt03Options.Query model,
        CancellationToken cancellationToken)
    {
        model.ReferenceEntity = referenceEntity;

        return Ok(await Mediator.Send(model, cancellationToken));
    }
}