using sic_api.Features.Marketplace;

namespace sic_api.Services.Interfaces;

public interface IMarketplaceInstallService
{
    Task<InstallMarketplace.Response> InstallAsync(
        Guid businessId,
        Guid marketplaceId,
        CancellationToken cancellationToken);
}