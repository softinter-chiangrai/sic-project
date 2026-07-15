using FluentValidation;
using MediatR;
using sic_api.Services.Interfaces;

namespace sic_api.Features.Marketplace;

public static class UninstallMarketplace
{
    public class Command : IRequest<Response>
    {
        public Guid MarketplaceId { get; set; }
    }

    public class Response
    {
        public Guid BusinessId { get; set; }

        public Guid MarketplaceId { get; set; }

        public string Status { get; set; } = default!;

        public List<TableModel> DroppedTables { get; set; } = [];
    }

    public class TableModel
    {
        public string Entity { get; set; } = default!;

        public string TableName { get; set; } = default!;
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
        : IRequestHandler<Command, Response>
    {
        public async Task<Response> Handle(
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