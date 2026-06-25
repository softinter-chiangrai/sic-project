using System.Text.Json;
using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using sic_api.Data;
using sic_api.Entities.Mp;

namespace sic_api.Services.Marketplace;

public class DynamicTableGeneratorService(SicDbContext dbContext)
{
    private static readonly Regex SafeNameRegex = new("^[a-zA-Z_][a-zA-Z0-9_]*$");

    public string BuildTableName(Guid businessId, Guid marketplaceId, string entityName)
    {
        EnsureSafeName(entityName);

        var businessKey = businessId.ToString("N")[..8].ToUpper();
        var appKey = marketplaceId.ToString("N")[..8].ToUpper();
        var tableKey = entityName.ToUpper();

        return $"MP_{businessKey}_{appKey}_{tableKey}";
    }

    public async Task CreateTableAsync(
        string tableName,
        MpEntity entity,
        CancellationToken cancellationToken)
    {
        EnsureSafeName(tableName);

        var columns = new List<string>
        {
            "id UUID PRIMARY KEY",
            "created_by VARCHAR(100) NOT NULL",
            "created_date TIMESTAMP NOT NULL",
            "updated_by VARCHAR(100) NOT NULL",
            "updated_date TIMESTAMP NOT NULL",
            "is_delete BOOLEAN NOT NULL DEFAULT FALSE",
            "delete_by VARCHAR(100)",
            "delete_date TIMESTAMP",
            "business_id UUID NOT NULL",
            "row_version INTEGER NOT NULL DEFAULT 0"
        };

        foreach (var field in entity.Fields.OrderBy(x => x.SeqNo))
        {
            EnsureSafeName(field.Field);

            var dbType = MapColumnType(field.Type);
            var nullable = field.IsRequired ? "NOT NULL" : "NULL";

            columns.Add($"{field.Field} {dbType} {nullable}");
        }

        var constraints = BuildConstraints(tableName, entity);

        var sql = $"""
        CREATE TABLE IF NOT EXISTS {tableName} (
            {string.Join(",\n            ", columns.Concat(constraints))}
        );
        """;

        await dbContext.Database.ExecuteSqlRawAsync(sql, cancellationToken);
    }

    private static List<string> BuildConstraints(string tableName, MpEntity entity)
    {
        var result = new List<string>();

        foreach (var constraint in entity.Constraints)
        {
            if (!string.Equals(constraint.ConstraintType, "UNIQUE_KEY", StringComparison.OrdinalIgnoreCase))
                continue;

            var fields = JsonSerializer.Deserialize<List<string>>(constraint.FieldsJson) ?? [];

            foreach (var field in fields)
            {
                EnsureSafeName(field);
            }

            var constraintName = $"uk_{tableName}_{string.Join("_", fields)}".ToLower();

            if (constraintName.Length > 60)
                constraintName = constraintName[..60];

            result.Add($"CONSTRAINT {constraintName} UNIQUE ({string.Join(", ", fields)})");
        }

        return result;
    }

    private static string MapColumnType(string type)
    {
        return type.Trim().ToUpperInvariant() switch
        {
            "STRING" => "varchar(500)",
            "TEXT" => "text",
            "AUTO" => "varchar(100)",
            "INTEGER" => "integer",
            "NUMBER" => "numeric(18, 2)",
            "DATE" => "timestamp with time zone",
            "BOOLEAN" => "boolean",
            "REFERENCE" => "uuid",
            "REFERANCE" => "uuid",
            _ => "varchar(500)"
        };
    }

    public static void EnsureSafeName(string name)
    {
        if (!SafeNameRegex.IsMatch(name))
            throw new InvalidOperationException($"Invalid database name: {name}");
    }
}