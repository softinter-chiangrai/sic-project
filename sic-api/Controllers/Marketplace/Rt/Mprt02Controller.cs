using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using sic_api.Features.Marketplace.Mprt02;

namespace sic_api.Controllers.Mprt;

[Route("api/mprt02")]
[Authorize]
public class Mprt02Controller : BaseController
{
    [HttpGet("marketplaces")]
    public async Task<IActionResult> GetMarketplaces(
        [FromQuery] GetMprt02Marketplaces.Query model,
        CancellationToken cancellationToken) =>
        Ok(await Mediator.Send(model, cancellationToken));

    [HttpGet("marketplaces/{marketplaceId:guid}")]
    public async Task<IActionResult> GetMarketplaceDetail(
        Guid marketplaceId,
        CancellationToken cancellationToken) =>
        Ok(await Mediator.Send(new GetMprt02MarketplaceDetail.Query
        {
            MarketplaceId = marketplaceId
        }, cancellationToken));

    [HttpPost("marketplaces/{marketplaceId:guid}/install")]
    public async Task<IActionResult> Install(
        Guid marketplaceId,
        CancellationToken cancellationToken) =>
        Ok(await Mediator.Send(new InstallMprt02Marketplace.Command
        {
            MarketplaceId = marketplaceId
        }, cancellationToken));

    [HttpDelete("marketplaces/{marketplaceId:guid}/uninstall")]
    public async Task<IActionResult> Uninstall(
        Guid marketplaceId,
        CancellationToken cancellationToken) =>
        Ok(await Mediator.Send(new UninstallMprt02Marketplace.Command
        {
            MarketplaceId = marketplaceId
        }, cancellationToken));
}