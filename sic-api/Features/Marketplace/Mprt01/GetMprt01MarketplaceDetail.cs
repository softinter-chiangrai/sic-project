using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using sic_api.Data;

namespace sic_api.Features.Marketplace.Mprt01;

public static class GetMprt01MarketplaceDetail
{
    public class Query : IRequest<Response>
    {
        public Guid MarketplaceId { get; set; }
    }

    public class Response
    {
        public Guid Id { get; set; }

        public string AppCode { get; set; } = default!;

        public string AppName { get; set; } = default!;

        public int EntityCount { get; set; }

        public int ProgramCount { get; set; }

        public int InstallCount { get; set; }

        public bool CanDelete { get; set; }

        public List<EntityModel> Entities { get; set; } = [];

        public List<ProgramModel> Programs { get; set; } = [];
    }

    public class EntityModel
    {
        public Guid Id { get; set; }

        public string Name { get; set; } = default!;

        public string LabelEn { get; set; } = default!;

        public string LabelLocal { get; set; } = default!;

        public int FieldCount { get; set; }
    }

    public class ProgramModel
    {
        public Guid Id { get; set; }

        public string ProgramCode { get; set; } = default!;

        public string NameEn { get; set; } = default!;

        public string NameLocal { get; set; } = default!;

        public string EntityName { get; set; } = default!;
    }

    public class Validator : AbstractValidator<Query>
    {
        public Validator()
        {
            RuleFor(x => x.MarketplaceId).NotEmpty();
        }
    }

    public sealed class Handler(SicDbContext dbContext)
        : IRequestHandler<Query, Response>
    {
        public async Task<Response> Handle(
            Query request,
            CancellationToken cancellationToken)
        {
            var marketplace = await dbContext.MpMarketplaces
                .AsNoTracking()
                .Include(x => x.Entities.Where(e => !e.IsDelete))
                    .ThenInclude(x => x.Fields.Where(f => !f.IsDelete))
                .Include(x => x.Programs.Where(p => !p.IsDelete))
                    .ThenInclude(x => x.Entity)
                .FirstOrDefaultAsync(x =>
                    x.Id == request.MarketplaceId &&
                    !x.IsDelete,
                    cancellationToken);

            if (marketplace is null)
                throw new InvalidOperationException("Marketplace not found.");

            var installCount = await dbContext.MpBusinessMarketplaces
                .AsNoTracking()
                .CountAsync(x =>
                    x.MarketplaceId == request.MarketplaceId &&
                    !x.IsDelete,
                    cancellationToken);

            return new Response
            {
                Id = marketplace.Id,
                AppCode = marketplace.AppCode,
                AppName = marketplace.AppName,
                EntityCount = marketplace.Entities.Count,
                ProgramCount = marketplace.Programs.Count,
                InstallCount = installCount,
                CanDelete = installCount == 0,
                Entities = marketplace.Entities
                    .OrderBy(x => x.Name)
                    .Select(x => new EntityModel
                    {
                        Id = x.Id,
                        Name = x.Name,
                        LabelEn = x.LabelEn,
                        LabelLocal = x.LabelLocal,
                        FieldCount = x.Fields.Count
                    })
                    .ToList(),
                Programs = marketplace.Programs
                    .OrderBy(x => x.ProgramCode)
                    .Select(x => new ProgramModel
                    {
                        Id = x.Id,
                        ProgramCode = x.ProgramCode,
                        NameEn = x.NameEn,
                        NameLocal = x.NameLocal,
                        EntityName = x.Entity.Name
                    })
                    .ToList()
            };
        }
    }
}