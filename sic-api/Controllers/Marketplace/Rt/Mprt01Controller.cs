using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using sic_api.Features.Marketplace.Mprt01;

namespace sic_api.Controllers.Marketplace.Mprt01;

[Route("api/mprt01")]
[Authorize]
public class Mprt01Controller : BaseController
{
    [HttpGet("marketplaces")]
    public async Task<IActionResult> Search(
        [FromQuery] GetMprt01Marketplaces.Query model,
        CancellationToken cancellationToken) =>
        Ok(await Mediator.Send(model, cancellationToken));

    [HttpGet("marketplaces/{marketplaceId:guid}")]
    public async Task<IActionResult> Detail(
        Guid marketplaceId,
        CancellationToken cancellationToken) =>
        Ok(await Mediator.Send(new GetMprt01MarketplaceDetail.Query
        {
            MarketplaceId = marketplaceId
        }, cancellationToken));

    [HttpPost("marketplaces")]
    public async Task<IActionResult> Save(
        [FromBody] SaveMprt01Marketplace.Command model,
        CancellationToken cancellationToken) =>
        Ok(await Mediator.Send(model, cancellationToken));

    [HttpPost("marketplaces/import")]
    public async Task<IActionResult> Import(
        [FromBody] ImportMprt01Marketplace.Command model,
        CancellationToken cancellationToken) =>
        Ok(await Mediator.Send(model, cancellationToken));

    [HttpDelete("marketplaces/{marketplaceId:guid}")]
    public async Task<IActionResult> Delete(
        Guid marketplaceId,
        CancellationToken cancellationToken) =>
        Ok(await Mediator.Send(new DeleteMprt01Marketplace.Command
        {
            MarketplaceId = marketplaceId
        }, cancellationToken));
}