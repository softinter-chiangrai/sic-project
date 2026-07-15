using System.Data;
using System.Text.Json;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using sic_api.Data;
using sic_api.Entities.Mp;
using sic_api.Services.Interfaces;

namespace sic_api.Features.Marketplace.Mprt04;

public static class SaveMprt04Transaction
{
    public class Command : IRequest<Response>
    {
        public string? ProgramCode { get; set; }

        public Guid? Id { get; set; }

        public Dictionary<string, object?> Header { get; set; } = [];

        public List<DetailRow> Details { get; set; } = [];
    }

    public class DetailRow
    {
        public Guid? Id { get; set; }

        /// <summary>
        /// 0 = no change, 2 = delete, 3 = update, 4 = create
        /// </summary>
        public int State { get; set; }

        public Dictionary<string, object?> Data { get; set; } = [];
    }

    public class Response
    {
        public Guid Id { get; set; }

        public string Status { get; set; } = default!;

        public int DetailCreated { get; set; }

        public int DetailUpdated { get; set; }

        public int DetailDeleted { get; set; }
    }

    private sealed class DetailContext
    {
        public Guid BusinessId { get; set; }

        public string TableName { get; set; } = default!;

        public List<MpEntityField> Fields { get; set; } = [];
    }

    public class Validator : AbstractValidator<Command>
    {
        public Validator()
        {
            RuleFor(x => x.ProgramCode).NotEmpty();
            RuleFor(x => x.Header).NotNull();
            RuleFor(x => x.Details).NotNull();

            RuleForEach(x => x.Details).ChildRules(row =>
            {
                row.RuleFor(x => x.State)
                    .Must(x => x is 0 or 2 or 3 or 4)
                    .WithMessage("Detail state must be 0, 2, 3 or 4.");

                row.When(x => x.State is 2 or 3, () =>
                {
                    row.RuleFor(x => x.Id)
                        .NotEmpty()
                        .WithMessage("Detail id is required for update/delete.");
                });
            });
        }
    }

    public sealed class Handler(
        SicDbContext dbContext,
        IBusinessAccessService businessAccessService,
        IDynamicDataService dynamicDataService)
        : IRequestHandler<Command, Response>
    {
        public async Task<Response> Handle(
            Command request,
            CancellationToken cancellationToken)
        {
            var businessId = businessAccessService.GetBusinessId();

            var trxContext = await Mprt04TransactionHelper.GetTransactionContextAsync(
                dbContext,
                request.ProgramCode!,
                cancellationToken);

            var detailContext = await GetDetailContextAsync(
                businessId,
                trxContext.DetailEntity.Id,
                cancellationToken);

            await using var transaction = await dbContext.Database.BeginTransactionAsync(cancellationToken);

            var response = new Response();

            Guid headerId;

            if (request.Id is null)
            {
                headerId = await dynamicDataService.CreateAsync(
                    businessId,
                    request.ProgramCode!,
                    request.Header,
                    cancellationToken);

                response.Status = "CREATED";
            }
            else
            {
                headerId = request.Id.Value;

                await dynamicDataService.UpdateAsync(
                    businessId,
                    request.ProgramCode!,
                    headerId,
                    request.Header,
                    cancellationToken);

                response.Status = "UPDATED";
            }

            foreach (var detail in request.Details)
            {
                switch (detail.State)
                {
                    case 0:
                        break;

                    case 4:
                    {
                        detail.Data[trxContext.DetailField] = headerId;

                        await CreateDetailAsync(
                            detailContext,
                            detail.Data,
                            cancellationToken);

                        response.DetailCreated++;
                        break;
                    }

                    case 3:
                    {
                        if (detail.Id is null)
                            throw new InvalidOperationException("Detail id is required for update.");

                        detail.Data[trxContext.DetailField] = headerId;

                        await UpdateDetailAsync(
                            detailContext,
                            detail.Id.Value,
                            detail.Data,
                            cancellationToken);

                        response.DetailUpdated++;
                        break;
                    }

                    case 2:
                    {
                        if (detail.Id is null)
                            throw new InvalidOperationException("Detail id is required for delete.");

                        await DeleteDetailAsync(
                            detailContext,
                            detail.Id.Value,
                            cancellationToken);

                        response.DetailDeleted++;
                        break;
                    }

                    default:
                        throw new InvalidOperationException($"Invalid detail state: {detail.State}");
                }
            }

            await transaction.CommitAsync(cancellationToken);

            response.Id = headerId;

            return response;
        }

        private async Task<DetailContext> GetDetailContextAsync(
            Guid businessId,
            Guid detailEntityId,
            CancellationToken cancellationToken)
        {
            var detailEntity = await dbContext.MpEntities
                .AsNoTracking()
                .Include(x => x.Fields)
                .FirstOrDefaultAsync(x =>
                    x.Id == detailEntityId &&
                    !x.IsDelete,
                    cancellationToken);

            if (detailEntity is null)
                throw new InvalidOperationException("Detail entity not found.");

            var table = await dbContext.MpBusinessEntityTables
                .AsNoTracking()
                .FirstOrDefaultAsync(x =>
                    x.BusinessId == businessId &&
                    x.EntityId == detailEntity.Id &&
                    !x.IsDelete,
                    cancellationToken);

            if (table is null)
                throw new InvalidOperationException(
                    $"Dynamic detail table for '{detailEntity.Name}' not found.");

            return new DetailContext
            {
                BusinessId = businessId,
                TableName = await Mprt04TransactionHelper.ResolveActualTableNameAsync(
                    dbContext,
                    table.TableName,
                    cancellationToken),
                Fields = detailEntity.Fields
                    .Where(x => !x.IsDelete)
                    .OrderBy(x => x.SeqNo)
                    .ToList()
            };
        }

        private async Task<Guid> CreateDetailAsync(
            DetailContext context,
            Dictionary<string, object?> data,
            CancellationToken cancellationToken)
        {
            var id = Guid.CreateVersion7();
            var now = DateTime.UtcNow;

            var columns = new List<string>
            {
                "id",
                "created_by",
                "created_date",
                "updated_by",
                "updated_date",
                "is_delete",
                "business_id"
            };

            var values = new List<string>
            {
                "@id",
                "@created_by",
                "@created_date",
                "@updated_by",
                "@updated_date",
                "@is_delete",
                "@business_id"
            };

            var parameters = new List<NpgsqlParameter>
            {
                new("id", id),
                new("created_by", "system"),
                new("created_date", now),
                new("updated_by", "system"),
                new("updated_date", now),
                new("is_delete", false),
                new("business_id", context.BusinessId)
            };

            foreach (var field in context.Fields)
            {
                if (IsSystemField(field.Field))
                    continue;

                var value = GetValue(data, field);

                columns.Add(field.Field);
                values.Add($"@{field.Field}");
                parameters.Add(new NpgsqlParameter(field.Field, ConvertValue(value, field.Type)));
            }

            var sql = $"""
                insert into {Mprt04TransactionHelper.Quote(context.TableName)}
                (
                    {string.Join(", ", columns.Select(Mprt04TransactionHelper.Quote))}
                )
                values
                (
                    {string.Join(", ", values)}
                )
                """;

            await ExecuteNonQueryAsync(sql, parameters, cancellationToken);

            return id;
        }

        private async Task UpdateDetailAsync(
            DetailContext context,
            Guid id,
            Dictionary<string, object?> data,
            CancellationToken cancellationToken)
        {
            var setParts = new List<string>
            {
                $"{Mprt04TransactionHelper.Quote("updated_by")} = @updated_by",
                $"{Mprt04TransactionHelper.Quote("updated_date")} = @updated_date"
            };

            var parameters = new List<NpgsqlParameter>
            {
                new("id", id),
                new("business_id", context.BusinessId),
                new("updated_by", "system"),
                new("updated_date", DateTime.UtcNow)
            };

            foreach (var field in context.Fields)
            {
                if (IsSystemField(field.Field))
                    continue;

                if (!HasValue(data, field))
                    continue;

                var value = GetValue(data, field);

                setParts.Add($"{Mprt04TransactionHelper.Quote(field.Field)} = @{field.Field}");
                parameters.Add(new NpgsqlParameter(field.Field, ConvertValue(value, field.Type)));
            }

            var sql = $"""
                update {Mprt04TransactionHelper.Quote(context.TableName)}
                set
                    {string.Join(",\n                    ", setParts)}
                where {Mprt04TransactionHelper.Quote("id")} = @id
                  and {Mprt04TransactionHelper.Quote("business_id")} = @business_id
                  and {Mprt04TransactionHelper.Quote("is_delete")} = false
                """;

            await ExecuteNonQueryAsync(sql, parameters, cancellationToken);
        }

        private async Task DeleteDetailAsync(
            DetailContext context,
            Guid id,
            CancellationToken cancellationToken)
        {
            var now = DateTime.UtcNow;

            var sql = $"""
                update {Mprt04TransactionHelper.Quote(context.TableName)}
                set
                    {Mprt04TransactionHelper.Quote("is_delete")} = true,
                    {Mprt04TransactionHelper.Quote("delete_by")} = @delete_by,
                    {Mprt04TransactionHelper.Quote("delete_date")} = @delete_date,
                    {Mprt04TransactionHelper.Quote("updated_by")} = @updated_by,
                    {Mprt04TransactionHelper.Quote("updated_date")} = @updated_date
                where {Mprt04TransactionHelper.Quote("id")} = @id
                  and {Mprt04TransactionHelper.Quote("business_id")} = @business_id
                  and {Mprt04TransactionHelper.Quote("is_delete")} = false
                """;

            var parameters = new List<NpgsqlParameter>
            {
                new("id", id),
                new("business_id", context.BusinessId),
                new("delete_by", "system"),
                new("delete_date", now),
                new("updated_by", "system"),
                new("updated_date", now)
            };

            await ExecuteNonQueryAsync(sql, parameters, cancellationToken);
        }

        private async Task<int> ExecuteNonQueryAsync(
            string sql,
            List<NpgsqlParameter> parameters,
            CancellationToken cancellationToken)
        {
            var connection = dbContext.Database.GetDbConnection();

            await using var command = connection.CreateCommand();
            command.CommandText = sql;

            foreach (var parameter in parameters)
            {
                command.Parameters.Add(parameter);
            }

            if (connection.State != ConnectionState.Open)
                await connection.OpenAsync(cancellationToken);

            return await command.ExecuteNonQueryAsync(cancellationToken);
        }

        private static bool HasValue(
            Dictionary<string, object?> data,
            MpEntityField field)
        {
            return data.ContainsKey(field.Name) || data.ContainsKey(field.Field);
        }

        private static object? GetValue(
            Dictionary<string, object?> data,
            MpEntityField field)
        {
            if (data.TryGetValue(field.Name, out var valueByName))
                return valueByName;

            if (data.TryGetValue(field.Field, out var valueByField))
                return valueByField;

            return null;
        }

        private static object ConvertValue(object? value, string type)
        {
            if (value is null)
                return DBNull.Value;

            if (value is JsonElement jsonElement)
                value = ConvertJsonElement(jsonElement);

            if (value is null)
                return DBNull.Value;

            var normalizedType = type.Trim().ToUpperInvariant();

            return normalizedType switch
            {
                "STRING" or "TEXT" or "AUTO" => value.ToString() ?? "",
                "INTEGER" => Convert.ToInt32(value),
                "NUMBER" => Convert.ToDecimal(value),
                "BOOLEAN" => Convert.ToBoolean(value),
                "DATE" => Convert.ToDateTime(value),
                "REFERENCE" or "REFERANCE" => value is Guid guid ? guid : Guid.Parse(value.ToString()!),
                _ => value
            };
        }

        private static object? ConvertJsonElement(JsonElement element)
        {
            return element.ValueKind switch
            {
                JsonValueKind.String => element.GetString(),
                JsonValueKind.Number => element.TryGetInt32(out var intValue)
                    ? intValue
                    : element.GetDecimal(),
                JsonValueKind.True => true,
                JsonValueKind.False => false,
                JsonValueKind.Null => null,
                _ => element.ToString()
            };
        }

        private static bool IsSystemField(string field)
        {
            var value = field.Trim().ToLowerInvariant();

            return value is
                "id" or
                "created_by" or
                "created_date" or
                "updated_by" or
                "updated_date" or
                "delete_by" or
                "delete_date" or
                "is_delete" or
                "business_id" or
                "row_version";
        }
    }
}