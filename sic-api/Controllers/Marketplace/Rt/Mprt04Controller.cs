using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using sic_api.Features.Marketplace.Mprt04;

namespace sic_api.Controllers.Marketplace.Mprt04;

[Route("api/mprt04")]
[Authorize]
public class Mprt04Controller : BaseController
{
    [HttpGet("{programCode}/detail-schema")]
    public async Task<IActionResult> GetDetailSchema(
        [FromRoute] string programCode,
        CancellationToken cancellationToken)
    {
        return Ok(await Mediator.Send(new GetMprt04DetailSchema.Query
        {
            ProgramCode = programCode
        }, cancellationToken));
    }

    [HttpGet("{programCode}/{id:guid}")]
    public async Task<IActionResult> Get(
        [FromRoute] string programCode,
        [FromRoute] Guid id,
        CancellationToken cancellationToken)
    {
        return Ok(await Mediator.Send(new GetMprt04Transaction.Query
        {
            ProgramCode = programCode,
            Id = id
        }, cancellationToken));
    }

    [HttpPost("{programCode}/save")]
    public async Task<IActionResult> Save(
        [FromRoute] string programCode,
        [FromBody] SaveMprt04Transaction.Command model,
        CancellationToken cancellationToken)
    {
        model.ProgramCode = programCode;

        return Ok(await Mediator.Send(model, cancellationToken));
    }

    [HttpDelete("{programCode}/{id:guid}")]
    public async Task<IActionResult> Delete(
        [FromRoute] string programCode,
        [FromRoute] Guid id,
        CancellationToken cancellationToken)
    {
        return Ok(await Mediator.Send(new DeleteMprt04Transaction.Command
        {
            ProgramCode = programCode,
            Id = id
        }, cancellationToken));
    }
}