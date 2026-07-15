using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using sic_api.Features.Marketplace;

namespace sic_api.Controllers.Marketplace;

[Route("api/marketplaces")]
[Authorize]
public class MarketplaceController : BaseController
{
    [HttpPost("import")]
    public async Task<IActionResult> Import(
        [FromBody] ImportMarketplace.Command model,
        CancellationToken cancellationToken) =>
        Ok(await Mediator.Send(model, cancellationToken));

    [HttpPost("{marketplaceId:guid}/install")]
    public async Task<IActionResult> Install(
        Guid marketplaceId,
        CancellationToken cancellationToken) =>
        Ok(await Mediator.Send(new InstallMarketplace.Command
        {
            MarketplaceId = marketplaceId
        }, cancellationToken));

    [HttpDelete("{marketplaceId:guid}/uninstall")]
    public async Task<IActionResult> Uninstall(
            Guid marketplaceId,
    CancellationToken cancellationToken) =>
    Ok(await Mediator.Send(new UninstallMarketplace.Command
    {
        MarketplaceId = marketplaceId
    }, cancellationToken));
}