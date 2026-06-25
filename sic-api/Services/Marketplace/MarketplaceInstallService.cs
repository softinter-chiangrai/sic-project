using Microsoft.EntityFrameworkCore;
using sic_api.Data;
using sic_api.Entities.Mp;
using sic_api.Features.Marketplace;
using sic_api.Services.Interfaces;

namespace sic_api.Services.Marketplace;

public class MarketplaceInstallService(
    SicDbContext dbContext,
    DynamicTableGeneratorService tableGeneratorService,
    DynamicInitialDataService initialDataService)
    : IMarketplaceInstallService
{
    public async Task<InstallMarketplace.Response> InstallAsync(
        Guid businessId,
        Guid marketplaceId,
        CancellationToken cancellationToken)
    {
        await using var tx = await dbContext.Database.BeginTransactionAsync(cancellationToken);

        var alreadyInstalled = await dbContext.MpBusinessMarketplaces
            .AnyAsync(x =>
                x.BusinessId == businessId &&
                x.MarketplaceId == marketplaceId &&
                !x.IsDelete,
                cancellationToken);

        if (alreadyInstalled)
            throw new InvalidOperationException("Marketplace already installed.");

        var marketplace = await dbContext.MpMarketplaces
            .Include(x => x.Entities)
                .ThenInclude(x => x.Fields)
            .Include(x => x.Entities)
                .ThenInclude(x => x.Constraints)
            .Include(x => x.Entities)
                .ThenInclude(x => x.Initials)
            .FirstOrDefaultAsync(x => x.Id == marketplaceId, cancellationToken);

        if (marketplace is null)
            throw new InvalidOperationException("Marketplace not found.");

        dbContext.MpBusinessMarketplaces.Add(new MpBusinessMarketplace
        {
            BusinessId = businessId,
            MarketplaceId = marketplaceId,
            InstallStatus = "INSTALLED",
            InstalledDate = DateTime.UtcNow
        });

        var tables = new List<InstallMarketplace.TableModel>();

        foreach (var entity in marketplace.Entities)
        {
            var tableName = tableGeneratorService.BuildTableName(businessId, marketplaceId, entity.Name);

            await tableGeneratorService.CreateTableAsync(
                tableName,
                entity,
                cancellationToken);

            dbContext.MpBusinessEntityTables.Add(new MpBusinessEntityTable
            {
                BusinessId = businessId,
                EntityId = entity.Id,
                TableName = tableName,
                Status = "ACTIVE"
            });

            await initialDataService.InsertInitialDataAsync(
                businessId,
                tableName,
                entity.Fields.OrderBy(x => x.SeqNo).ToList(),
                entity.Initials.OrderBy(x => x.SeqNo).ToList(),
                cancellationToken);

            tables.Add(new InstallMarketplace.TableModel
            {
                Entity = entity.Name,
                TableName = tableName
            });
        }

        await dbContext.SaveChangesAsync(cancellationToken);
        await tx.CommitAsync(cancellationToken);

        return new InstallMarketplace.Response
        {
            BusinessId = businessId,
            MarketplaceId = marketplaceId,
            Status = "INSTALLED",
            Tables = tables
        };
    }
}