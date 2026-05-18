using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using sic_api.Features.Su.TaskMaster;
using sic_api.Features.Su.UserTask;

namespace sic_api.Controllers.Su;

[Route("api/su/tasks")]
[Authorize]
public class SuTaskController : BaseController
{
    [HttpGet("lov")]
    public async Task<IActionResult> Lov([FromQuery] GetSuTaskLov.Query model, CancellationToken cancellationToken) =>
        Ok(await Mediator.Send(model, cancellationToken));

    [HttpGet("search")]
    public async Task<IActionResult> Search([FromQuery] SearchSuUserTasks.Query model, CancellationToken cancellationToken) =>
        Ok(await Mediator.Send(model, cancellationToken));

    [HttpPost("save")]
    public async Task<IActionResult> Save([FromBody] SaveSuUserTask.Command[] model, CancellationToken cancellationToken)
    {
        var ids = await Mediator.Send(new SaveSuUserTask.BatchCommand
        {
            Items = model
        }, cancellationToken);

        if (ids is null)
        {
            return NotFound();
        }

        return Ok(ids);
    }
}
