using Microsoft.EntityFrameworkCore;
using sic_api.Data;
using sic_api.Features.Marketplace;
using sic_api.Services.Interfaces;

namespace sic_api.Services.Marketplace;

public class MarketplaceUninstallService(SicDbContext dbContext)
    : IMarketplaceUninstallService
{
    public async Task<UninstallMarketplace.Response> UninstallAsync(
        Guid businessId,
        Guid marketplaceId,
        CancellationToken cancellationToken)
    {
        await using var tx = await dbContext.Database.BeginTransactionAsync(cancellationToken);

        var installed = await dbContext.MpBusinessMarketplaces
            .FirstOrDefaultAsync(x =>
                x.BusinessId == businessId &&
                x.MarketplaceId == marketplaceId &&
                !x.IsDelete,
                cancellationToken);

        if (installed is null)
            throw new InvalidOperationException("Marketplace is not installed.");

        var marketplace = await dbContext.MpMarketplaces
            .AsNoTracking()
            .Include(x => x.Entities)
            .FirstOrDefaultAsync(x =>
                x.Id == marketplaceId &&
                !x.IsDelete,
                cancellationToken);

        if (marketplace is null)
            throw new InvalidOperationException("Marketplace not found.");

        var entityIds = marketplace.Entities
            .Select(x => x.Id)
            .ToList();

        var businessTables = await dbContext.MpBusinessEntityTables
            .Include(x => x.Entity)
            .Where(x =>
                x.BusinessId == businessId &&
                entityIds.Contains(x.EntityId) &&
                !x.IsDelete)
            .ToListAsync(cancellationToken);

        var droppedTables = new List<UninstallMarketplace.TableModel>();

        foreach (var table in businessTables)
        {
            DynamicTableGeneratorService.EnsureSafeName(table.TableName);

            var sql = $"""
            DROP TABLE IF EXISTS {table.TableName};
            """;

            await dbContext.Database.ExecuteSqlRawAsync(sql, cancellationToken);

            table.Status = "DROPPED";
            table.IsDelete = true;
            table.DeleteBy = "system";
            table.DeleteDate = DateTime.UtcNow;
            table.UpdatedBy = "system";
            table.UpdatedDate = DateTime.UtcNow;

            droppedTables.Add(new UninstallMarketplace.TableModel
            {
                Entity = table.Entity.Name,
                TableName = table.TableName
            });
        }

        installed.InstallStatus = "UNINSTALLED";
        installed.IsDelete = true;
        installed.DeleteBy = "system";
        installed.DeleteDate = DateTime.UtcNow;
        installed.UpdatedBy = "system";
        installed.UpdatedDate = DateTime.UtcNow;

        await dbContext.SaveChangesAsync(cancellationToken);
        await tx.CommitAsync(cancellationToken);

        return new UninstallMarketplace.Response
        {
            BusinessId = businessId,
            MarketplaceId = marketplaceId,
            Status = "UNINSTALLED",
            DroppedTables = droppedTables
        };
    }
}