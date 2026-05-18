using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using sic_api.Features.Su.Program;

namespace sic_api.Controllers.Su;

[Route("api/su/programs")]
[Authorize]
public class SuProgramController : BaseController
{
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] GetAllSuPrograms.Query model, CancellationToken cancellationToken) =>
        Ok(await Mediator.Send(model, cancellationToken));

    [HttpGet("paging")]
    public async Task<IActionResult> Paging([FromQuery] GetSuProgramPage.Query model, CancellationToken cancellationToken) =>
        Ok(await Mediator.Send(model, cancellationToken));

    [HttpGet("lov")]
    public async Task<IActionResult> Lov(CancellationToken cancellationToken) =>
        Ok(await Mediator.Send(new GetSuProgramLov.Query(), cancellationToken));

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById([FromRoute] GetSuProgramById.Query model, CancellationToken cancellationToken)
    {
        var item = await Mediator.Send(model, cancellationToken);
        return item is null ? NotFound() : Ok(item);
    }

    [HttpPost("save")]
    public async Task<IActionResult> Save([FromBody] SaveSuProgram.Command model, CancellationToken cancellationToken)
    {
        Guid? id = await Mediator.Send(model, cancellationToken);
        if (id is null)
        {
            return NotFound();
        }

        return CreatedAtAction(nameof(GetById), new { id }, id);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, [FromBody] DeleteSuProgram.Command model, CancellationToken cancellationToken)
    {
        model.Id = id;
        var deleted = await Mediator.Send(model, cancellationToken);
        return deleted ? NoContent() : NotFound();
    }
}
