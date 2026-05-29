using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using sic_api.Controllers;
using sic_api.Features.Su.Message;

namespace sic_api.Controllers.Su;

[Route("api/su/messages")]
[Authorize]
public class MessageController : BaseController
{
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> Select([FromQuery] GetMessages.Query model, CancellationToken cancellationToken) =>
        Ok(await Mediator.Send(model, cancellationToken));

    [AllowAnonymous]
    [HttpPost("save")]
    public async Task<IActionResult> Save([FromBody] SaveMessage.Command model, CancellationToken cancellationToken)
    {
        var id = await Mediator.Send(model, cancellationToken);
        if (id is null)
        {
            return NotFound();
        }

        return Ok(id);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(
        Guid id,
        [FromBody] DeleteMessage.Command model,
        CancellationToken cancellationToken)
    {
        model.Id = id;
        var deleted = await Mediator.Send(model, cancellationToken);
        return deleted ? NoContent() : NotFound();
    }

    [AllowAnonymous]    
    [HttpGet("/api/i18n/{module_code}/{program_code}/{language_code?}")]
    public async Task<IActionResult> I18n(
        string module_code,
        string program_code,
        string? language_code,
        CancellationToken cancellationToken) =>
        Ok(await Mediator.Send(new GetI18NMessages.Query
        {
            ModuleCode = module_code,
            ProgramCode = program_code,
            LanguageCode = language_code
        }, cancellationToken));
}
