using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using sic_api.Features.Dynamic;

namespace sic_api.Controllers.Dynamic;

[Route("api/dynamic")]
[Authorize]
public class DynamicController : BaseController
{
    [HttpGet("{programCode}/schema")]
    public async Task<IActionResult> Schema(
        string programCode,
        CancellationToken cancellationToken) =>
        Ok(await Mediator.Send(new GetDynamicSchema.Query
        {
            ProgramCode = programCode
        }, cancellationToken));

[HttpPost("{programCode}/search")]
public async Task<IActionResult> Search(
    [FromRoute] string programCode,
    [FromBody] SearchDynamicData.Request model,
    CancellationToken cancellationToken)
{
    return Ok(await Mediator.Send(new SearchDynamicData.Query
    {
        ProgramCode = programCode,
        Keyword = model.Keyword,
        PageNumber = model.PageNumber,
        PageSize = model.PageSize,
        Sorts = model.Sorts
    }, cancellationToken));
}

    [HttpGet("{programCode}/{id:guid}")]
    public async Task<IActionResult> GetById(
        string programCode,
        Guid id,
        CancellationToken cancellationToken) =>
        Ok(await Mediator.Send(new GetDynamicData.Query
        {
            ProgramCode = programCode,
            Id = id
        }, cancellationToken));

    [HttpPost("{programCode}")]
    public async Task<IActionResult> Create(
        string programCode,
        [FromBody] Dictionary<string, object?> data,
        CancellationToken cancellationToken) =>
        Ok(await Mediator.Send(new CreateDynamicData.Command
        {
            ProgramCode = programCode,
            Data = data
        }, cancellationToken));

    [HttpPut("{programCode}/{id:guid}")]
    public async Task<IActionResult> Update(
        string programCode,
        Guid id,
        [FromBody] Dictionary<string, object?> data,
        CancellationToken cancellationToken) =>
        Ok(await Mediator.Send(new UpdateDynamicData.Command
        {
            ProgramCode = programCode,
            Id = id,
            Data = data
        }, cancellationToken));

    [HttpDelete("{programCode}/{id:guid}")]
    public async Task<IActionResult> Delete(
        string programCode,
        Guid id,
        CancellationToken cancellationToken) =>
        Ok(await Mediator.Send(new DeleteDynamicData.Command
        {
            ProgramCode = programCode,
            Id = id
        }, cancellationToken));
}