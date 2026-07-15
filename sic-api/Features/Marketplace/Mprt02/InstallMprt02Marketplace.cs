using FluentValidation;
using MediatR;
using sic_api.Features.Marketplace;
using sic_api.Services.Interfaces;

namespace sic_api.Features.Marketplace.Mprt02;

public static class InstallMprt02Marketplace
{
    public class Command : IRequest<InstallMarketplace.Response>
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
        IMarketplaceInstallService marketplaceInstallService)
        : IRequestHandler<Command, InstallMarketplace.Response>
    {
        public async Task<InstallMarketplace.Response> Handle(
            Command request,
            CancellationToken cancellationToken)
        {
            var businessId = businessAccessService.GetBusinessId();

            return await marketplaceInstallService.InstallAsync(
                businessId,
                request.MarketplaceId,
                cancellationToken);
        }
    }
}