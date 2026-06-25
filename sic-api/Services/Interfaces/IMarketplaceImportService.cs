using sic_api.Features.Marketplace;

namespace sic_api.Services.Interfaces;

public interface IMarketplaceImportService
{
    Task<ImportMarketplace.Response> ImportAsync(
        ImportMarketplace.Command request,
        CancellationToken cancellationToken);
}