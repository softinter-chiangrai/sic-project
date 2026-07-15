using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using sic_api.Data;
using sic_api.Entities.Mp;

namespace sic_api.Services.Marketplace;

public class DynamicInitialDataService(SicDbContext dbContext)
{
    public async Task InsertInitialDataAsync(
        Guid businessId,
        string tableName,
        List<MpEntityField> fields,
        List<MpEntityInitial> initials,
        CancellationToken cancellationToken)
    {
        DynamicTableGeneratorService.EnsureSafeName(tableName);

        foreach (var initial in initials)
        {
            var data = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(initial.DataJson);

            if (data is null)
                continue;

            var id = data.TryGetValue("id", out var idValue)
                ? Guid.Parse(idValue.GetString()!)
                : Guid.CreateVersion7();

            var columns = new List<string>
            {
                "id",
                "created_by",
                "created_date",
                "updated_by",
                "updated_date",
                "is_delete",
                "business_id",
                "row_version"
            };

            var valueNames = new List<string>
            {
                "@id",
                "@created_by",
                "@created_date",
                "@updated_by",
                "@updated_date",
                "@is_delete",
                "@business_id",
                "@row_version"
            };

            var parameters = new List<NpgsqlParameter>
            {
                new("@id", id),
                new("@created_by", "system"),
                new("@created_date", DateTime.UtcNow),
                new("@updated_by", "system"),
                new("@updated_date", DateTime.UtcNow),
                new("@is_delete", false),
                new("@business_id", businessId),
                new NpgsqlParameter("@row_version", NpgsqlTypes.NpgsqlDbType.Integer) {  Value = 0 }
            };

            var index = 0;

            foreach (var field in fields.OrderBy(x => x.SeqNo))
            {
                DynamicTableGeneratorService.EnsureSafeName(field.Field);

                if (!data.TryGetValue(field.Name, out var jsonValue))
                    continue;

                var parameterName = $"@p{index++}";

                columns.Add(field.Field);
                valueNames.Add(parameterName);

                parameters.Add(new NpgsqlParameter(
                    parameterName,
                    ConvertJsonValue(jsonValue, field.Type) ?? DBNull.Value));
            }

            var sql = $"""
            INSERT INTO {tableName}
            ({string.Join(", ", columns)})
            VALUES
            ({string.Join(", ", valueNames)})
            ON CONFLICT (id) DO NOTHING;
            """;

            await dbContext.Database.ExecuteSqlRawAsync(sql, parameters, cancellationToken);
        }
    }

    private static object? ConvertJsonValue(JsonElement value, string type)
    {
        if (value.ValueKind == JsonValueKind.Null)
            return null;

        return type.ToLower() switch
        {
            "string" => value.GetString(),
            "boolean" => value.GetBoolean(),
            "integer" => value.GetInt32(),
            "number" => value.GetDecimal(),
            "date" => DateOnly.Parse(value.GetString()!),
            "datetime" => DateTime.Parse(value.GetString()!),
            "reference" => Guid.Parse(value.GetString()!),
            _ => value.ToString()
        };
    }
}