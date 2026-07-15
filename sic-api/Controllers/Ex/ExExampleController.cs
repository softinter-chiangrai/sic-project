using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using sic_api.Filters;
using sic_api.Features.Ex.Example;

namespace sic_api.Controllers.Ex;

[Route("api/ex/examples")]
[Authorize]
[ProgramAuthorize("EX_EXAMPLE")]
public class ExExampleController : BaseController
{

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] GetAllExExamples.Query model, CancellationToken cancellationToken) =>
        Ok(await Mediator.Send(model, cancellationToken));

    [HttpGet("paging")]
    public async Task<IActionResult> Paging([FromQuery] GetExExamplePage.Query model, CancellationToken cancellationToken) =>
        Ok(await Mediator.Send(model, cancellationToken));

    [HttpGet("lov")]
    public async Task<IActionResult> Lov([FromQuery] GetExExampleLov.Query model, CancellationToken cancellationToken) =>
        Ok(await Mediator.Send(model, cancellationToken));

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById([FromRoute] GetExExampleById.Query model, CancellationToken cancellationToken)
    {
        var item = await Mediator.Send(model, cancellationToken);
        return item is null ? NotFound() : Ok(item);
    }

    [HttpPost("save")]
    public async Task<IActionResult> Save(
        [FromBody] SaveExExample.Command model,
        CancellationToken cancellationToken)
    {
        Guid? id = await Mediator.Send(model, cancellationToken);
        if (id is null)
        {
            return NotFound();
        }
        return CreatedAtAction(nameof(GetById), new { id }, id);
    }

    [HttpPost("grid-save")]
    public async Task<IActionResult> GridSave(
        [FromBody] GridSaveExExample.Command[] model,
        CancellationToken cancellationToken)
    {
        var ids = await Mediator.Send(new GridSaveExExample.BatchCommand
        {
            Items = model
        }, cancellationToken);

        if (ids is null)
        {
            return NotFound();
        }

        return Ok(ids);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete([FromRoute] DeleteExExample.Command model, CancellationToken cancellationToken)
    {
        var deleted = (bool?)await Mediator.Send(model, cancellationToken);

        return deleted == true ? NoContent() : NotFound();
    }
}
