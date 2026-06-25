using System.Data;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using sic_api.Data;
using sic_api.Entities.Mp;
using sic_api.Features.Dynamic;
using sic_api.Model;
using sic_api.Services.Interfaces;
using sic_api.Services.Marketplace;

namespace sic_api.Services.Dynamic;

public class DynamicDataService(SicDbContext dbContext, IAutoRunningService autoRunningService) : IDynamicDataService
{
    public async Task<PaginationBase<Dictionary<string, object?>>> SearchAsync(
        Guid businessId,
        SearchDynamicData.Query request,
        CancellationToken cancellationToken)
    {
        var context = await GetDynamicContextAsync(
            businessId,
            request.ProgramCode,
            cancellationToken);

        var pageNumber = request.PageNumber <= 0 ? 1 : request.PageNumber;
        var pageSize = request.PageSize <= 0 ? 10 : request.PageSize;
        var offset = (pageNumber - 1) * pageSize;

        var searchableFields = context.Fields
            .Where(x => string.Equals(x.Type, "string", StringComparison.OrdinalIgnoreCase))
            .OrderBy(x => x.SeqNo)
            .ToList();

        var parameters = new List<NpgsqlParameter>
        {
            new("@business_id", businessId),
            new("@limit", pageSize),
            new("@offset", offset),
        };

        var where = """
        WHERE business_id = @business_id
          AND is_delete = false
        """;

        if (request.Id != null)
        {
            where += " AND id = @id ";
            parameters.Add(new NpgsqlParameter("@id", request.Id));
        }

        if (!string.IsNullOrWhiteSpace(request.Keyword) && searchableFields.Count > 0)
        {
            parameters.Add(new NpgsqlParameter("@keyword", $"%{request.Keyword.Trim()}%"));

            var keywordSql = searchableFields
                .Select(x =>
                {
                    DynamicTableGeneratorService.EnsureSafeName(x.Field);
                    return $"{x.Field} ILIKE @keyword";
                });

            where += $" AND ({string.Join(" OR ", keywordSql)})";
        }

        var orderBy = "created_date DESC";

        if (request.Sorts is not null && request.Sorts.Any())
        {
            var sort = request.Sorts.First();

            var allowedFields = context.Fields
                .Select(x => x.Name)
                .ToHashSet(StringComparer.OrdinalIgnoreCase);

            var allowedColumns = context.Fields
                .Select(x => x.Field)
                .ToHashSet(StringComparer.OrdinalIgnoreCase);

            var sortField = sort.Field;

            if (allowedFields.Contains(sortField))
            {
                var meta = context.Fields.First(x =>
                    x.Name.Equals(sortField, StringComparison.OrdinalIgnoreCase));

                sortField = meta.Field;
            }

            if (allowedColumns.Contains(sortField))
            {
                DynamicTableGeneratorService.EnsureSafeName(sortField);

                var direction = sort.Descending
                    ? "DESC"
                    : "ASC";

                orderBy = $"{sortField} {direction}";
            }
        }

        DynamicTableGeneratorService.EnsureSafeName(context.TableName);

        var countSql = $"""
        SELECT COUNT(*)
        FROM {context.TableName}
        {where};
        """;

        var totalElements = await ExecuteScalarLongAsync(countSql, parameters, cancellationToken);

        var selectColumns = BuildSelectColumns(context.Fields);

        var sql = $"""
        SELECT {selectColumns}
        FROM {context.TableName}
        {where}
        ORDER BY {orderBy}
        LIMIT @limit OFFSET @offset;
        """;

        var data = await ExecuteDictionaryListAsync(sql, parameters, cancellationToken);

        return new PaginationBase<Dictionary<string, object?>>
        {
            Data = data.ToArray(),
            Pageable = new Pageable
            {
                PageNumber = pageNumber,
                PageSize = pageSize,
                TotalElements = totalElements,
                Sorts = request.Sorts
            }
        };
    }

    public async Task<Dictionary<string, object?>?> GetByIdAsync(
        Guid businessId,
        string programCode,
        Guid id,
        CancellationToken cancellationToken)
    {
        var context = await GetDynamicContextAsync(
            businessId,
            programCode,
            cancellationToken);

        DynamicTableGeneratorService.EnsureSafeName(context.TableName);

        var selectColumns = BuildSelectColumns(context.Fields);

        var sql = $"""
        SELECT {selectColumns}
        FROM {context.TableName}
        WHERE id = @id
          AND business_id = @business_id
          AND is_delete = false
        LIMIT 1;
        """;

        var parameters = new List<NpgsqlParameter>
        {
            new("@id", id),
            new("@business_id", businessId)
        };

        var data = await ExecuteDictionaryListAsync(sql, parameters, cancellationToken);

        return data.FirstOrDefault();
    }

    public async Task<Guid> CreateAsync(
        Guid businessId,
        string programCode,
        Dictionary<string, object?> data,
        CancellationToken cancellationToken)
    {
        var context = await GetDynamicContextAsync(
            businessId,
            programCode,
            cancellationToken);

        await ApplyAutoFieldsAsync(context, data, cancellationToken);

        DynamicTableGeneratorService.EnsureSafeName(context.TableName);

        var id = Guid.CreateVersion7();

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

        var values = new List<string>
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
            new NpgsqlParameter("@row_version", NpgsqlTypes.NpgsqlDbType.Integer) { Value = 0 }
        };

        var index = 0;

        foreach (var field in context.Fields.OrderBy(x => x.SeqNo))
        {
            DynamicTableGeneratorService.EnsureSafeName(field.Field);

            if (!data.TryGetValue(field.Name, out var value))
                continue;

            var parameterName = $"@p{index++}";

            columns.Add(field.Field);
            values.Add(parameterName);

            parameters.Add(new NpgsqlParameter(
                parameterName,
                ConvertInputValue(value, field.Type) ?? DBNull.Value));
        }

        var sql = $"""
        INSERT INTO {context.TableName}
        ({string.Join(", ", columns)})
        VALUES
        ({string.Join(", ", values)});
        """;

        await dbContext.Database.ExecuteSqlRawAsync(sql, parameters, cancellationToken);

        return id;
    }

    public async Task<Guid?> UpdateAsync(
        Guid businessId,
        string programCode,
        Guid id,
        Dictionary<string, object?> data,
        CancellationToken cancellationToken)
    {
        var context = await GetDynamicContextAsync(
            businessId,
            programCode,
            cancellationToken);

        DynamicTableGeneratorService.EnsureSafeName(context.TableName);

        var sets = new List<string>
        {
            "updated_by = @updated_by",
            "updated_date = @updated_date",
            "row_version = row_version + 1"
        };

        var parameters = new List<NpgsqlParameter>
        {
            new("@id", id),
            new("@business_id", businessId),
            new("@updated_by", "system"),
            new("@updated_date", DateTime.UtcNow)
        };

        var index = 0;

        foreach (var field in context.Fields.OrderBy(x => x.SeqNo))
        {
            DynamicTableGeneratorService.EnsureSafeName(field.Field);

            if (!data.TryGetValue(field.Name, out var value))
                continue;

            var parameterName = $"@p{index++}";

            sets.Add($"{field.Field} = {parameterName}");

            parameters.Add(new NpgsqlParameter(
                parameterName,
                ConvertInputValue(value, field.Type) ?? DBNull.Value));
        }

        var sql = $"""
        UPDATE {context.TableName}
        SET {string.Join(", ", sets)}
        WHERE id = @id
          AND business_id = @business_id
          AND is_delete = false;
        """;

        var affected = await dbContext.Database.ExecuteSqlRawAsync(sql, parameters, cancellationToken);

        return affected > 0 ? id : null;
    }

    public async Task<bool> DeleteAsync(
        Guid businessId,
        string programCode,
        Guid id,
        CancellationToken cancellationToken)
    {
        var context = await GetDynamicContextAsync(
            businessId,
            programCode,
            cancellationToken);

        DynamicTableGeneratorService.EnsureSafeName(context.TableName);

        var sql = $"""
        UPDATE {context.TableName}
        SET is_delete = true,
            delete_by = @delete_by,
            delete_date = @delete_date,
            updated_by = @updated_by,
            updated_date = @updated_date,
            row_version = row_version + 1
        WHERE id = @id
          AND business_id = @business_id
          AND is_delete = false;
        """;

        var parameters = new List<NpgsqlParameter>
        {
            new("@id", id),
            new("@business_id", businessId),
            new("@delete_by", "system"),
            new("@delete_date", DateTime.UtcNow),
            new("@updated_by", "system"),
            new("@updated_date", DateTime.UtcNow)
        };

        var affected = await dbContext.Database.ExecuteSqlRawAsync(sql, parameters, cancellationToken);

        return affected > 0;
    }

    private async Task<DynamicContext> GetDynamicContextAsync(
        Guid businessId,
        string programCode,
        CancellationToken cancellationToken)
    {
        var program = await dbContext.MpPrograms
            .AsNoTracking()
            .Include(x => x.Entity)
                .ThenInclude(x => x.Fields)
            .FirstOrDefaultAsync(x =>
                x.ProgramCode == programCode &&
                !x.IsDelete,
                cancellationToken);

        if (program is null)
            throw new InvalidOperationException("Program not found.");

        var table = await dbContext.MpBusinessEntityTables
            .AsNoTracking()
            .FirstOrDefaultAsync(x =>
                x.BusinessId == businessId &&
                x.EntityId == program.EntityId &&
                x.Status == "ACTIVE" &&
                !x.IsDelete,
                cancellationToken);

        if (table is null)
            throw new InvalidOperationException("Business has not installed this program.");

        return new DynamicContext
        {
            Program = program,
            Entity = program.Entity,
            Fields = program.Entity.Fields.OrderBy(x => x.SeqNo).ToList(),
            TableName = table.TableName
        };
    }

    private static string BuildSelectColumns(List<MpEntityField> fields)
    {
        var columns = new List<string>
        {
            "id",
            "created_by",
            "created_date",
            "updated_by",
            "updated_date",
            "is_delete",
            "delete_by",
            "delete_date",
            "business_id",
            "row_version"
        };

        foreach (var field in fields.OrderBy(x => x.SeqNo))
        {
            DynamicTableGeneratorService.EnsureSafeName(field.Field);
            columns.Add(field.Field);
        }

        return string.Join(", ", columns);
    }

    private async Task<long> ExecuteScalarLongAsync(
        string sql,
        List<NpgsqlParameter> parameters,
        CancellationToken cancellationToken)
    {
        var connection = dbContext.Database.GetDbConnection();

        if (connection.State != ConnectionState.Open)
            await connection.OpenAsync(cancellationToken);

        await using var command = connection.CreateCommand();
        command.CommandText = sql;

        foreach (var parameter in parameters)
        {
            var clone = new NpgsqlParameter(parameter.ParameterName, parameter.Value);
            command.Parameters.Add(clone);
        }

        var result = await command.ExecuteScalarAsync(cancellationToken);

        return Convert.ToInt64(result);
    }

    private async Task<List<Dictionary<string, object?>>> ExecuteDictionaryListAsync(
        string sql,
        List<NpgsqlParameter> parameters,
        CancellationToken cancellationToken)
    {
        var connection = dbContext.Database.GetDbConnection();

        if (connection.State != ConnectionState.Open)
            await connection.OpenAsync(cancellationToken);

        await using var command = connection.CreateCommand();
        command.CommandText = sql;

        foreach (var parameter in parameters)
        {
            var clone = new NpgsqlParameter(parameter.ParameterName, parameter.Value);
            command.Parameters.Add(clone);
        }

        var result = new List<Dictionary<string, object?>>();

        await using var reader = await command.ExecuteReaderAsync(cancellationToken);

        while (await reader.ReadAsync(cancellationToken))
        {
            var item = new Dictionary<string, object?>();

            for (var i = 0; i < reader.FieldCount; i++)
            {
                var value = await reader.IsDBNullAsync(i, cancellationToken)
                    ? null
                    : reader.GetValue(i);

                item[reader.GetName(i)] = value;
            }

            result.Add(item);
        }

        return result;
    }

    private static object? ConvertInputValue(object? value, string type)
    {
        if (value is null)
            return null;

        if (value is JsonElement json)
            return ConvertJsonElement(json, type);

        return (type ?? "").Trim().ToLowerInvariant() switch
        {
            "string" => ToStringValue(value),
            "boolean" => ToBoolean(value),
            "integer" => ToInteger(value),
            "number" => ToDecimal(value),
            "date" => ToDateOnly(value),
            "datetime" => ToDateTime(value),
            "reference" => ToGuid(value),
            "referance" => ToGuid(value),
            _ => ToStringValue(value)
        };
    }

    private static object? ConvertJsonElement(JsonElement value, string type)
    {
        if (value.ValueKind == JsonValueKind.Null || value.ValueKind == JsonValueKind.Undefined)
            return null;

        return (type ?? "").Trim().ToLowerInvariant() switch
        {
            "string" => value.ValueKind == JsonValueKind.String ? value.GetString() : value.ToString(),

            "boolean" => value.ValueKind is JsonValueKind.True or JsonValueKind.False
                ? value.GetBoolean()
                : ToBoolean(value.ToString()),

            "integer" => value.ValueKind == JsonValueKind.Number
                ? value.GetInt32()
                : ToInteger(value.ToString()),

            "number" => value.ValueKind == JsonValueKind.Number
                ? value.GetDecimal()
                : ToDecimal(value.ToString()),

            "date" => ToDateOnly(value.ValueKind == JsonValueKind.String ? value.GetString() : value.ToString()),

            "datetime" => ToDateTime(value.ValueKind == JsonValueKind.String ? value.GetString() : value.ToString()),

            "reference" => ToGuid(value.ValueKind == JsonValueKind.String ? value.GetString() : value.ToString()),

            "referance" => ToGuid(value.ValueKind == JsonValueKind.String ? value.GetString() : value.ToString()),

            _ => value.ToString()
        };
    }

    private static string? ToStringValue(object? value)
    {
        if (value is null)
            return null;

        var text = value.ToString();

        return string.IsNullOrWhiteSpace(text)
            ? null
            : text;
    }

    private static bool? ToBoolean(object? value)
    {
        if (value is null)
            return null;

        if (value is bool boolean)
            return boolean;

        var text = value.ToString();

        if (string.IsNullOrWhiteSpace(text))
            return null;

        if (bool.TryParse(text, out var parsedBoolean))
            return parsedBoolean;

        if (text == "1")
            return true;

        if (text == "0")
            return false;

        throw new FormatException($"Invalid boolean value: {text}");
    }

    private static int? ToInteger(object? value)
    {
        if (value is null)
            return null;

        if (value is int integer)
            return integer;

        var text = value.ToString();

        if (string.IsNullOrWhiteSpace(text))
            return null;

        if (int.TryParse(text, out var parsedInteger))
            return parsedInteger;

        throw new FormatException($"Invalid integer value: {text}");
    }

    private static decimal? ToDecimal(object? value)
    {
        if (value is null)
            return null;

        if (value is decimal number)
            return number;

        if (value is int integer)
            return integer;

        if (value is long longNumber)
            return longNumber;

        if (value is double doubleNumber)
            return Convert.ToDecimal(doubleNumber);

        if (value is float floatNumber)
            return Convert.ToDecimal(floatNumber);

        var text = value.ToString();

        if (string.IsNullOrWhiteSpace(text))
            return null;

        if (decimal.TryParse(text, out var parsedDecimal))
            return parsedDecimal;

        throw new FormatException($"Invalid number value: {text}");
    }

    private static DateOnly? ToDateOnly(object? value)
    {
        if (value is null)
            return null;

        if (value is DateOnly dateOnly)
            return dateOnly;

        if (value is DateTime dateTime)
            return DateOnly.FromDateTime(dateTime);

        if (value is DateTimeOffset dateTimeOffset)
            return DateOnly.FromDateTime(dateTimeOffset.LocalDateTime);

        var text = value.ToString();

        if (string.IsNullOrWhiteSpace(text))
            return null;

        if (DateOnly.TryParse(text, out var parsedDateOnly))
            return parsedDateOnly;

        if (DateTimeOffset.TryParse(text, out var parsedDateTimeOffset))
            return DateOnly.FromDateTime(parsedDateTimeOffset.LocalDateTime);

        if (DateTime.TryParse(text, out var parsedDateTime))
            return DateOnly.FromDateTime(parsedDateTime);

        throw new FormatException($"Invalid date value: {text}");
    }

    private static DateTime? ToDateTime(object? value)
    {
        if (value is null)
            return null;

        if (value is DateTime dateTime)
            return dateTime;

        if (value is DateTimeOffset dateTimeOffset)
            return dateTimeOffset.UtcDateTime;

        var text = value.ToString();

        if (string.IsNullOrWhiteSpace(text))
            return null;

        if (DateTimeOffset.TryParse(text, out var parsedDateTimeOffset))
            return parsedDateTimeOffset.UtcDateTime;

        if (DateTime.TryParse(text, out var parsedDateTime))
            return parsedDateTime;

        throw new FormatException($"Invalid datetime value: {text}");
    }

    private static Guid? ToGuid(object? value)
    {
        if (value is null)
            return null;

        if (value is Guid guid)
            return guid;

        var text = value.ToString();

        if (string.IsNullOrWhiteSpace(text))
            return null;

        if (Guid.TryParse(text, out var parsedGuid))
            return parsedGuid;

        throw new FormatException($"Invalid guid value: {text}");
    }

    private class DynamicContext
    {
        public MpProgram Program { get; set; } = default!;

        public MpEntity Entity { get; set; } = default!;

        public List<MpEntityField> Fields { get; set; } = [];

        public string TableName { get; set; } = default!;
    }

    private async Task ApplyAutoFieldsAsync(
        DynamicContext context,
        Dictionary<string, object?> data,
        CancellationToken cancellationToken)
    {
        var autoFields = context.Fields
            .Where(x => string.Equals(x.Type, "AUTO", StringComparison.OrdinalIgnoreCase))
            .ToList();

        foreach (var field in autoFields)
        {
            if (string.IsNullOrWhiteSpace(field.Format))
                throw new InvalidOperationException($"AUTO field '{field.Name}' requires format.");

            var hasValueByName = data.TryGetValue(field.Name, out var valueByName)
                && valueByName is not null
                && !string.IsNullOrWhiteSpace(valueByName.ToString());

            var hasValueByField = data.TryGetValue(field.Field, out var valueByField)
                && valueByField is not null
                && !string.IsNullOrWhiteSpace(valueByField.ToString());

            if (hasValueByName || hasValueByField)
                continue;

            var generatedValue = await autoRunningService.GenerateAsync(
                context.TableName,
                field.Field,
                field.Format,
                cancellationToken);

            data[field.Name] = generatedValue;
            data[field.Field] = generatedValue;
        }
    }
}