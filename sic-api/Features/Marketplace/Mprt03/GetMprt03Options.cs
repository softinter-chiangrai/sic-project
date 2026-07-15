using System.Data;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using sic_api.Data;
using sic_api.Model;
using sic_api.Services.Interfaces;

namespace sic_api.Features.Marketplace.Mprt03;

public static class GetMprt03Options
{
    public class Query : PageableCombobox, IRequest<PaginationBase<LovBase>>
    {
        public string? ReferenceEntity { get; set; }
    }

    public class Validator : AbstractValidator<Query>
    {
        public Validator()
        {
            RuleFor(x => x.ReferenceEntity).NotEmpty();
        }
    }

    public sealed class Handler(
        SicDbContext dbContext,
        IRequestLanguageProvider requestLanguageProvider,
        IBusinessAccessService businessAccessService)
        : IRequestHandler<Query, PaginationBase<LovBase>>
    {
        public async Task<PaginationBase<LovBase>> Handle(
            Query request,
            CancellationToken cancellationToken)
        {
            var businessId = businessAccessService.GetBusinessId();
            var useEnglish = requestLanguageProvider.UseEnglish();

            var pageNumber = request.PageNumber <= 0 ? 1 : request.PageNumber;
            var pageSize = request.PageSize <= 0 ? 10 : request.PageSize;
            var keyword = request.Keyword?.Trim();
            var value = request.Value;

            var reference = ParseReferenceEntity(request.ReferenceEntity!);

            var entityQuery = dbContext.MpEntities
                .AsNoTracking()
                .Include(x => x.Marketplace)
                .Where(x =>
                    !x.IsDelete &&
                    x.Name == reference.EntityName);

            if (reference.MarketplaceId is not null)
            {
                entityQuery = entityQuery.Where(x =>
                    x.MarketplaceId == reference.MarketplaceId.Value);
            }
            else if (!string.IsNullOrWhiteSpace(reference.MarketplaceCode))
            {
                entityQuery = entityQuery.Where(x =>
                    x.Marketplace.AppCode == reference.MarketplaceCode);
            }

            var entity = await entityQuery.FirstOrDefaultAsync(cancellationToken);

            if (entity is null)
                throw new InvalidOperationException(
                    $"Reference entity '{request.ReferenceEntity}' not found.");

            var bilingual = await dbContext.MpEntityBilinguals
                .AsNoTracking()
                .FirstOrDefaultAsync(x =>
                    !x.IsDelete &&
                    x.EntityId == entity.Id,
                    cancellationToken);

            if (bilingual is null)
                throw new InvalidOperationException(
                    $"Bilingual config for entity '{entity.Name}' not found.");

            var textField = useEnglish
                ? bilingual.KeyEn
                : bilingual.KeyLocal;

            var keywordFields = new[]
            {
                bilingual.KeyLocal,
                bilingual.KeyEn,
                bilingual.Key
            }
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray();

            var table = await dbContext.MpBusinessEntityTables
                .AsNoTracking()
                .FirstOrDefaultAsync(x =>
                    !x.IsDelete &&
                    x.BusinessId == businessId &&
                    x.EntityId == entity.Id,
                    cancellationToken);

            if (table is null)
                throw new InvalidOperationException(
                    $"Dynamic table for reference entity '{entity.Name}' not found.");

            var actualTableName = await ResolveActualTableNameAsync(
                table.TableName,
                cancellationToken);

            var totalElements = await CountOptionsAsync(
                tableName: actualTableName,
                keywordFields: keywordFields,
                keyword: keyword,
                value: value,
                businessId: businessId,
                cancellationToken: cancellationToken);

            var data = await QueryOptionsAsync(
                tableName: actualTableName,
                textField: textField,
                keywordFields: keywordFields,
                keyword: keyword,
                value: value,
                pageNumber: pageNumber,
                pageSize: pageSize,
                businessId: businessId,
                cancellationToken: cancellationToken);

            return new PaginationBase<LovBase>
            {
                Data = data,
                Pageable = new Pageable
                {
                    PageNumber = pageNumber,
                    PageSize = pageSize,
                    TotalElements = totalElements,
                    Sorts = request.Sorts
                }
            };
        }

        private sealed class ReferenceInfo
        {
            public Guid? MarketplaceId { get; set; }

            public string? MarketplaceCode { get; set; }

            public string EntityName { get; set; } = default!;
        }

        private static ReferenceInfo ParseReferenceEntity(string referenceEntity)
        {
            var parts = referenceEntity
                .Split('.', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

            if (parts.Length == 0)
                throw new InvalidOperationException("Invalid referenceEntity.");

            if (parts.Length == 1)
            {
                return new ReferenceInfo
                {
                    EntityName = parts[0]
                };
            }

            var prefix = parts[0];
            var entityName = parts[^1];

            if (Guid.TryParse(prefix, out var marketplaceId))
            {
                return new ReferenceInfo
                {
                    MarketplaceId = marketplaceId,
                    EntityName = entityName
                };
            }

            return new ReferenceInfo
            {
                MarketplaceCode = prefix,
                EntityName = entityName
            };
        }

        private async Task<string> ResolveActualTableNameAsync(
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
            command.Parameters.Add(new NpgsqlParameter("table_name", tableName));

            if (connection.State != ConnectionState.Open)
                await connection.OpenAsync(cancellationToken);

            var result = await command.ExecuteScalarAsync(cancellationToken);

            if (result is null || result == DBNull.Value)
                throw new InvalidOperationException($"Dynamic table '{tableName}' does not exist.");

            return result.ToString()!;
        }

        private async Task<long> CountOptionsAsync(
            string tableName,
            string[] keywordFields,
            string? keyword,
            Guid? value,
            Guid businessId,
            CancellationToken cancellationToken)
        {
            var whereParts = BuildWhereParts(
                keywordFields,
                keyword,
                value,
                out var parameters);

            parameters.Add(new NpgsqlParameter("business_id", businessId));

            var sql = $"""
                select count(*)
                from {Quote(tableName)}
                where {Quote("business_id")} = @business_id
                  and {Quote("is_delete")} = false
                  {whereParts}
                """;

            var connection = dbContext.Database.GetDbConnection();

            await using var command = connection.CreateCommand();
            command.CommandText = sql;

            foreach (var parameter in parameters)
            {
                command.Parameters.Add(parameter);
            }

            if (connection.State != ConnectionState.Open)
                await connection.OpenAsync(cancellationToken);

            var result = await command.ExecuteScalarAsync(cancellationToken);

            return result is null || result == DBNull.Value
                ? 0
                : Convert.ToInt64(result);
        }

        private async Task<LovBase[]> QueryOptionsAsync(
            string tableName,
            string textField,
            string[] keywordFields,
            string? keyword,
            Guid? value,
            int pageNumber,
            int pageSize,
            Guid businessId,
            CancellationToken cancellationToken)
        {
            var offset = (pageNumber - 1) * pageSize;

            var whereParts = BuildWhereParts(
                keywordFields,
                keyword,
                value,
                out var parameters);

            parameters.Add(new NpgsqlParameter("business_id", businessId));
            parameters.Add(new NpgsqlParameter("limit", pageSize));
            parameters.Add(new NpgsqlParameter("offset", offset));

            var sql = $"""
                select
                    {Quote("id")} as value,
                    coalesce({Quote(textField)}::text, '') as text
                from {Quote(tableName)}
                where {Quote("business_id")} = @business_id
                  and {Quote("is_delete")} = false
                  {whereParts}
                order by {Quote(textField)} asc
                limit @limit offset @offset
                """;

            var connection = dbContext.Database.GetDbConnection();

            await using var command = connection.CreateCommand();
            command.CommandText = sql;

            foreach (var parameter in parameters)
            {
                command.Parameters.Add(parameter);
            }

            if (connection.State != ConnectionState.Open)
                await connection.OpenAsync(cancellationToken);

            await using var reader = await command.ExecuteReaderAsync(cancellationToken);

            var data = new List<LovBase>();

            while (await reader.ReadAsync(cancellationToken))
            {
                data.Add(new LovBase
                {
                    Value = reader.IsDBNull(0) ? "" : reader.GetGuid(0),
                    Text = reader.IsDBNull(1) ? "" : reader.GetString(1)
                });
            }

            return data.ToArray();
        }

        private static string BuildWhereParts(
            string[] keywordFields,
            string? keyword,
            Guid? value,
            out List<NpgsqlParameter> parameters)
        {
            parameters = [];

            var whereParts = new List<string>();

            if (value.HasValue)
            {
                whereParts.Add($"and {Quote("id")} = @value");
                parameters.Add(new NpgsqlParameter("value", value.Value));
            }

            if (!string.IsNullOrWhiteSpace(keyword) && keywordFields.Length > 0)
            {
                var keywordWhere = string.Join(" or ", keywordFields.Select(field =>
                    $"lower(coalesce({Quote(field)}::text, '')) like lower(@keyword)"));

                whereParts.Add($"and ({keywordWhere})");
                parameters.Add(new NpgsqlParameter("keyword", $"%{keyword.Trim()}%"));
            }

            return whereParts.Count == 0
                ? ""
                : "\n                  " + string.Join("\n                  ", whereParts);
        }

        private static string Quote(string identifier)
        {
            return $"\"{identifier.Replace("\"", "\"\"")}\"";
        }
    }
}