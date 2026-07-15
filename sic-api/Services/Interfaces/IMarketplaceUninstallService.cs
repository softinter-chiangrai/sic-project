using sic_api.Features.Marketplace;

namespace sic_api.Services.Interfaces;

public interface IMarketplaceUninstallService
{
    Task<UninstallMarketplace.Response> UninstallAsync(
        Guid businessId,
        Guid marketplaceId,
        CancellationToken cancellationToken);
}