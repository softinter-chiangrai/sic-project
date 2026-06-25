using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using sic_api.Data;

namespace sic_api.Features.Marketplace.Mprt01;

public static class DeleteMprt01Marketplace
{
    public class Command : IRequest<Response>
    {
        public Guid MarketplaceId { get; set; }
    }

    public class Response
    {
        public Guid MarketplaceId { get; set; }

        public string Status { get; set; } = default!;
    }

    public class Validator : AbstractValidator<Command>
    {
        public Validator()
        {
            RuleFor(x => x.MarketplaceId).NotEmpty();
        }
    }

    public sealed class Handler(SicDbContext dbContext)
        : IRequestHandler<Command, Response>
    {
        public async Task<Response> Handle(
            Command request,
            CancellationToken cancellationToken)
        {
            var installCount = await dbContext.MpBusinessMarketplaces
                .CountAsync(x =>
                    x.MarketplaceId == request.MarketplaceId &&
                    !x.IsDelete,
                    cancellationToken);

            if (installCount > 0)
                throw new InvalidOperationException("Cannot delete marketplace because it has been installed.");

            var marketplace = await dbContext.MpMarketplaces
                .Include(x => x.Entities)
                    .ThenInclude(x => x.Fields)
                .Include(x => x.Entities)
                    .ThenInclude(x => x.Constraints)
                .Include(x => x.Entities)
                    .ThenInclude(x => x.Bilinguals)
                .Include(x => x.Entities)
                    .ThenInclude(x => x.Initials)
                .Include(x => x.Programs)
                .FirstOrDefaultAsync(x =>
                    x.Id == request.MarketplaceId &&
                    !x.IsDelete,
                    cancellationToken);

            if (marketplace is null)
                throw new InvalidOperationException("Marketplace not found.");

            var now = DateTime.UtcNow;

            marketplace.IsDelete = true;
            marketplace.DeleteDate = now;
            marketplace.UpdatedDate = now;

            foreach (var entity in marketplace.Entities)
            {
                entity.IsDelete = true;
                entity.DeleteDate = now;
                entity.UpdatedDate = now;

                foreach (var field in entity.Fields)
                {
                    field.IsDelete = true;
                    field.DeleteDate = now;
                    field.UpdatedDate = now;
                }

                foreach (var constraint in entity.Constraints)
                {
                    constraint.IsDelete = true;
                    constraint.DeleteDate = now;
                    constraint.UpdatedDate = now;
                }

                foreach (var bilingual in entity.Bilinguals)
                {
                    bilingual.IsDelete = true;
                    bilingual.DeleteDate = now;
                    bilingual.UpdatedDate = now;
                }

                foreach (var initial in entity.Initials)
                {
                    initial.IsDelete = true;
                    initial.DeleteDate = now;
                    initial.UpdatedDate = now;
                }
            }

            foreach (var program in marketplace.Programs)
            {
                program.IsDelete = true;
                program.DeleteDate = now;
                program.UpdatedDate = now;
            }

            await dbContext.SaveChangesAsync(cancellationToken);

            return new Response
            {
                MarketplaceId = request.MarketplaceId,
                Status = "DELETED"
            };
        }
    }
}