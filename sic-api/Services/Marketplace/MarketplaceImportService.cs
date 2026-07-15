using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using sic_api.Data;
using sic_api.Entities.Mp;
using sic_api.Features.Marketplace;
using sic_api.Services.Interfaces;

namespace sic_api.Services.Marketplace;

public class MarketplaceImportService(SicDbContext dbContext) : IMarketplaceImportService
{
    public async Task<ImportMarketplace.Response> ImportAsync(
        ImportMarketplace.Command request,
        CancellationToken cancellationToken)
    {
        await using var tx = await dbContext.Database.BeginTransactionAsync(cancellationToken);

        var marketplace = await dbContext.MpMarketplaces
            .FirstOrDefaultAsync(x => x.Id == request.Id || x.AppCode == request.AppCode, cancellationToken);

        if (marketplace is null)
        {
            marketplace = new MpMarketplace
            {
                Id = request.Id,
                AppCode = request.AppCode,
                AppName = request.AppName
            };

            dbContext.MpMarketplaces.Add(marketplace);
        }
        else
        {
            marketplace.AppCode = request.AppCode;
            marketplace.AppName = request.AppName;
            marketplace.UpdatedDate = DateTime.UtcNow;
        }

        await dbContext.SaveChangesAsync(cancellationToken);

        foreach (var entityModel in request.Entities)
        {
            var entity = await dbContext.MpEntities
                .FirstOrDefaultAsync(x =>
                    x.MarketplaceId == marketplace.Id &&
                    x.Name == entityModel.Name,
                    cancellationToken);

            if (entity is null)
            {
                entity = new MpEntity
                {
                    MarketplaceId = marketplace.Id,
                    Name = entityModel.Name,
                    Description = entityModel.Description,
                    LabelEn = entityModel.Label_En,
                    LabelLocal = entityModel.Label_Local
                };

                dbContext.MpEntities.Add(entity);
                await dbContext.SaveChangesAsync(cancellationToken);
            }
            else
            {
                entity.Description = entityModel.Description;
                entity.LabelEn = entityModel.Label_En;
                entity.LabelLocal = entityModel.Label_Local;
                entity.UpdatedDate = DateTime.UtcNow;
            }

            await ReplaceFieldsAsync(entity.Id, entityModel.Fields, cancellationToken);
            await ReplaceConstraintsAsync(entity.Id, entityModel.Constraint, cancellationToken);
            await ReplaceBilingualsAsync(entity.Id, entityModel.Bilingual, cancellationToken);
            await ReplaceInitialsAsync(entity.Id, entityModel.Initial, cancellationToken);
        }

        await dbContext.SaveChangesAsync(cancellationToken);

        foreach (var programModel in request.Programs)
        {
            var entityName = programModel.Config.Entity.Split('.').Last();

            var entity = await dbContext.MpEntities
                .FirstOrDefaultAsync(x =>
                    x.MarketplaceId == marketplace.Id &&
                    x.Name == entityName,
                    cancellationToken);

            if (entity is null)
                throw new InvalidOperationException($"Entity not found: {entityName}");

            var program = await dbContext.MpPrograms
                .FirstOrDefaultAsync(x =>
                    x.MarketplaceId == marketplace.Id &&
                    x.ProgramCode == programModel.ProgramCode,
                    cancellationToken);

            if (program is null)
            {
                program = new MpProgram
                {
                    MarketplaceId = marketplace.Id,
                    EntityId = entity.Id,
                    ProgramCode = programModel.ProgramCode,
                    Icon = programModel.Icon,
                    NameEn = programModel.NameEn,
                    NameLocal = programModel.NameLocal,
                    Template = programModel.Template
                };

                dbContext.MpPrograms.Add(program);
            }
            else
            {
                program.EntityId = entity.Id;
                program.Icon = programModel.Icon;
                program.NameEn = programModel.NameEn;
                program.NameLocal = programModel.NameLocal;
                program.Template = programModel.Template;
                program.UpdatedDate = DateTime.UtcNow;
            }
        }

        await dbContext.SaveChangesAsync(cancellationToken);
        await tx.CommitAsync(cancellationToken);

        return new ImportMarketplace.Response
        {
            Id = marketplace.Id,
            AppCode = marketplace.AppCode,
            AppName = marketplace.AppName,
            Status = "IMPORTED"
        };
    }

    private async Task ReplaceFieldsAsync(
        Guid entityId,
        List<ImportMarketplace.FieldModel> fields,
        CancellationToken cancellationToken)
    {
        var oldItems = await dbContext.MpEntityFields
            .Where(x => x.EntityId == entityId)
            .ToListAsync(cancellationToken);

        dbContext.MpEntityFields.RemoveRange(oldItems);

        var seqNo = 1;

        foreach (var field in fields)
        {
            dbContext.MpEntityFields.Add(new MpEntityField
            {
                EntityId = entityId,
                Name = field.Name,
                Field = field.Field,
                Format = field.Format,
                Type = field.Type,
                IsRequired = field.Require,
                LabelEn = field.Label_En,
                LabelLocal = field.Label_Local,
                ReferenceEntity = field.Reference_Entity,
                SeqNo = seqNo++
            });
        }
    }

    private async Task ReplaceConstraintsAsync(
        Guid entityId,
        List<ImportMarketplace.ConstraintModel> constraints,
        CancellationToken cancellationToken)
    {
        var oldItems = await dbContext.MpEntityConstraints
            .Where(x => x.EntityId == entityId)
            .ToListAsync(cancellationToken);

        dbContext.MpEntityConstraints.RemoveRange(oldItems);

        foreach (var item in constraints)
        {
            dbContext.MpEntityConstraints.Add(new MpEntityConstraint
            {
                EntityId = entityId,
                ConstraintType = item.Constraint_Type,
                FieldsJson = JsonSerializer.Serialize(item.Fields)
            });
        }
    }

    private async Task ReplaceBilingualsAsync(
        Guid entityId,
        List<ImportMarketplace.BilingualModel> bilinguals,
        CancellationToken cancellationToken)
    {
        var oldItems = await dbContext.MpEntityBilinguals
            .Where(x => x.EntityId == entityId)
            .ToListAsync(cancellationToken);

        dbContext.MpEntityBilinguals.RemoveRange(oldItems);

        foreach (var item in bilinguals)
        {
            dbContext.MpEntityBilinguals.Add(new MpEntityBilingual
            {
                EntityId = entityId,
                Key = item.Key,
                KeyEn = item.Key_En,
                KeyLocal = item.Key_Local
            });
        }
    }

    private async Task ReplaceInitialsAsync(
        Guid entityId,
        List<Dictionary<string, object?>> initials,
        CancellationToken cancellationToken)
    {
        var oldItems = await dbContext.MpEntityInitials
            .Where(x => x.EntityId == entityId)
            .ToListAsync(cancellationToken);

        dbContext.MpEntityInitials.RemoveRange(oldItems);

        var seqNo = 1;

        foreach (var item in initials)
        {
            dbContext.MpEntityInitials.Add(new MpEntityInitial
            {
                EntityId = entityId,
                DataJson = JsonSerializer.Serialize(item),
                SeqNo = seqNo++
            });
        }
    }
}