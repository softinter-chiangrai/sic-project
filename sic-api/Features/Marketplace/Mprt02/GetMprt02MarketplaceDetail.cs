using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using sic_api.Data;
using sic_api.Services.Interfaces;

namespace sic_api.Features.Marketplace.Mprt02;

public static class GetMprt02MarketplaceDetail
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

        public bool Installed { get; set; }

        public string InstallStatus { get; set; } = "NOT_INSTALLED";

        public DateTime? InstalledDate { get; set; }

        public List<EntityModel> Entities { get; set; } = [];

        public List<ProgramModel> Programs { get; set; } = [];

        public List<TableModel> Tables { get; set; } = [];
    }

    public class EntityModel
    {
        public Guid Id { get; set; }

        public string Name { get; set; } = default!;

        public string Description { get; set; } = default!;

        public string LabelEn { get; set; } = default!;

        public string LabelLocal { get; set; } = default!;

        public List<FieldModel> Fields { get; set; } = [];
    }

    public class FieldModel
    {
        public string Name { get; set; } = default!;

        public string Field { get; set; } = default!;

        public string Type { get; set; } = default!;

        public bool IsRequired { get; set; }

        public string LabelEn { get; set; } = default!;

        public string LabelLocal { get; set; } = default!;

        public string? ReferenceEntity { get; set; }

        public int SeqNo { get; set; }
    }

    public class ProgramModel
    {
        public Guid Id { get; set; }

        public string ProgramCode { get; set; } = default!;

        public string Icon { get; set; } = default!;

        public string NameEn { get; set; } = default!;

        public string NameLocal { get; set; } = default!;

        public string Template { get; set; } = default!;

        public Guid EntityId { get; set; }

        public string EntityName { get; set; } = default!;
    }

    public class TableModel
    {
        public Guid EntityId { get; set; }

        public string EntityName { get; set; } = default!;

        public string TableName { get; set; } = default!;

        public string Status { get; set; } = default!;
    }

    public class Validator : AbstractValidator<Query>
    {
        public Validator()
        {
            RuleFor(x => x.MarketplaceId).NotEmpty();
        }
    }

    public sealed class Handler(
        SicDbContext dbContext,
        IBusinessAccessService businessAccessService)
        : IRequestHandler<Query, Response>
    {
        public async Task<Response> Handle(
            Query request,
            CancellationToken cancellationToken)
        {
            var businessId = businessAccessService.GetBusinessId();

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

            var installed = await dbContext.MpBusinessMarketplaces
                .AsNoTracking()
                .FirstOrDefaultAsync(x =>
                    x.BusinessId == businessId &&
                    x.MarketplaceId == request.MarketplaceId &&
                    !x.IsDelete,
                    cancellationToken);

            var entityIds = marketplace.Entities.Select(x => x.Id).ToList();

            var tables = await dbContext.MpBusinessEntityTables
                .AsNoTracking()
                .Include(x => x.Entity)
                .Where(x =>
                    x.BusinessId == businessId &&
                    entityIds.Contains(x.EntityId) &&
                    !x.IsDelete)
                .OrderBy(x => x.Entity.Name)
                .Select(x => new TableModel
                {
                    EntityId = x.EntityId,
                    EntityName = x.Entity.Name,
                    TableName = x.TableName,
                    Status = x.Status
                })
                .ToListAsync(cancellationToken);

            return new Response
            {
                Id = marketplace.Id,
                AppCode = marketplace.AppCode,
                AppName = marketplace.AppName,
                Installed = installed is not null,
                InstallStatus = installed?.InstallStatus ?? "NOT_INSTALLED",
                InstalledDate = installed?.InstalledDate,
                Entities = marketplace.Entities
                    .OrderBy(x => x.Name)
                    .Select(x => new EntityModel
                    {
                        Id = x.Id,
                        Name = x.Name,
                        Description = x.Description,
                        LabelEn = x.LabelEn,
                        LabelLocal = x.LabelLocal,
                        Fields = x.Fields
                            .OrderBy(f => f.SeqNo)
                            .Select(f => new FieldModel
                            {
                                Name = f.Name,
                                Field = f.Field,
                                Type = f.Type,
                                IsRequired = f.IsRequired,
                                LabelEn = f.LabelEn,
                                LabelLocal = f.LabelLocal,
                                ReferenceEntity = f.ReferenceEntity,
                                SeqNo = f.SeqNo
                            })
                            .ToList()
                    })
                    .ToList(),
                Programs = marketplace.Programs
                    .OrderBy(x => x.ProgramCode)
                    .Select(x => new ProgramModel
                    {
                        Id = x.Id,
                        ProgramCode = x.ProgramCode,
                        Icon = x.Icon,
                        NameEn = x.NameEn,
                        NameLocal = x.NameLocal,
                        Template = x.Template,
                        EntityId = x.EntityId,
                        EntityName = x.Entity.Name
                    })
                    .ToList(),
                Tables = tables
            };
        }
    }
}