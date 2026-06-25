using Microsoft.EntityFrameworkCore;
using sic_api.Data;
using sic_api.Entities.Mp;

namespace sic_api.Features.Marketplace.Mprt04;

public static class Mprt04TransactionHelper
{
    public sealed class TransactionContext
    {
        public MpProgram Program { get; set; } = default!;

        public MpEntity HeaderEntity { get; set; } = default!;

        public MpEntity DetailEntity { get; set; } = default!;

        public MpEntityField DetailRelationField { get; set; } = default!;

        public string DetailField => DetailRelationField.Field;
    }

    public static async Task<TransactionContext> GetTransactionContextAsync(
        SicDbContext dbContext,
        string programCode,
        CancellationToken cancellationToken)
    {
        var program = await dbContext.MpPrograms
            .AsNoTracking()
            .Include(x => x.Entity)
            .FirstOrDefaultAsync(x =>
                x.ProgramCode == programCode &&
                !x.IsDelete,
                cancellationToken);

        if (program is null)
            throw new InvalidOperationException($"Program '{programCode}' not found.");

        if (!string.Equals(program.Template, "TRANSACTION_DATA", StringComparison.OrdinalIgnoreCase))
            throw new InvalidOperationException($"Program '{programCode}' is not TRANSACTION_DATA.");

        var headerEntity = program.Entity;

        var detailEntities = await dbContext.MpEntities
            .AsNoTracking()
            .Include(x => x.Fields)
            .Where(x =>
                x.MarketplaceId == program.MarketplaceId &&
                x.Id != headerEntity.Id &&
                !x.IsDelete)
            .ToListAsync(cancellationToken);

        foreach (var detailEntity in detailEntities)
        {
            var relationField = detailEntity.Fields
                .Where(x => !x.IsDelete)
                .FirstOrDefault(x =>
                    IsReferenceToHeader(x.ReferenceEntity, headerEntity.Name));

            if (relationField is not null)
            {
                return new TransactionContext
                {
                    Program = program,
                    HeaderEntity = headerEntity,
                    DetailEntity = detailEntity,
                    DetailRelationField = relationField
                };
            }
        }

        throw new InvalidOperationException(
            $"Detail entity not found. Please add reference field to header entity '{headerEntity.Name}'.");
    }

    private static bool IsReferenceToHeader(
        string? referenceEntity,
        string headerEntityName)
    {
        if (string.IsNullOrWhiteSpace(referenceEntity))
            return false;

        var value = referenceEntity.Trim();

        if (string.Equals(value, headerEntityName, StringComparison.OrdinalIgnoreCase))
            return true;

        if (value.EndsWith("." + headerEntityName, StringComparison.OrdinalIgnoreCase))
            return true;

        return false;
    }

    public static async Task<string> ResolveActualTableNameAsync(
        SicDbContext dbContext,
        string tableName,
        CancellationToken cancellationToken)
    {
        var sql = """
            select table_name
            from information_schema.tables
            where table_schema = current_schema()
              and lower(table_name) = lower(@table_name)
            limit 1
            """;

        var connection = dbContext.Database.GetDbConnection();

        await using var command = connection.CreateCommand();
        command.CommandText = sql;
        command.Parameters.Add(new Npgsql.NpgsqlParameter("table_name", tableName));

        if (connection.State != System.Data.ConnectionState.Open)
            await connection.OpenAsync(cancellationToken);

        var result = await command.ExecuteScalarAsync(cancellationToken);

        if (result is null || result == DBNull.Value)
            throw new InvalidOperationException($"Dynamic table '{tableName}' does not exist.");

        return result.ToString()!;
    }

    public static string Quote(string identifier)
    {
        return $"\"{identifier.Replace("\"", "\"\"")}\"";
    }
}