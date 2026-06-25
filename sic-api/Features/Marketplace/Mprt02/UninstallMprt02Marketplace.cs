using FluentValidation;
using MediatR;
using sic_api.Features.Marketplace;
using sic_api.Services.Interfaces;

namespace sic_api.Features.Marketplace.Mprt02;

public static class UninstallMprt02Marketplace
{
    public class Command : IRequest<UninstallMarketplace.Response>
    {
        public Guid MarketplaceId { get; set; }
    }

    public class Validator : AbstractValidator<Command>
    {
        public Validator()
        {
            RuleFor(x => x.MarketplaceId).NotEmpty();
        }
    }

    public sealed class Handler(
        IBusinessAccessService businessAccessService,
        IMarketplaceUninstallService marketplaceUninstallService)
        : IRequestHandler<Command, UninstallMarketplace.Response>
    {
        public async Task<UninstallMarketplace.Response> Handle(
            Command request,
            CancellationToken cancellationToken)
        {
            var businessId = businessAccessService.GetBusinessId();

            return await marketplaceUninstallService.UninstallAsync(
                businessId,
                request.MarketplaceId,
                cancellationToken);
        }
    }
}