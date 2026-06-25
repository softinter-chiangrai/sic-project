using System.Data;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using sic_api.Data;
using sic_api.Services.Interfaces;

namespace sic_api.Features.Marketplace.Mprt04;

public static class GetMprt04Transaction
{
    public class Query : IRequest<Response>
    {
        public string? ProgramCode { get; set; }

        public Guid Id { get; set; }
    }

    public class Response
    {
        public Guid Id { get; set; }

        public Dictionary<string, object?> Header { get; set; } = [];

        public List<DetailRow> Details { get; set; } = [];
    }

    public class DetailRow
    {
        public Guid? Id { get; set; }

        public int State { get; set; } = 0;

        public Dictionary<string, object?> Data { get; set; } = [];
    }

    public class Validator : AbstractValidator<Query>
    {
        public Validator()
        {
            RuleFor(x => x.ProgramCode).NotEmpty();
            RuleFor(x => x.Id).NotEmpty();
        }
    }

    public sealed class Handler(
        SicDbContext dbContext,
        IBusinessAccessService businessAccessService,
        IDynamicDataService dynamicDataService)
        : IRequestHandler<Query, Response>
    {
        public async Task<Response> Handle(
            Query request,
            CancellationToken cancellationToken)
        {
            var businessId = businessAccessService.GetBusinessId();

            var trxContext = await Mprt04TransactionHelper.GetTransactionContextAsync(
                dbContext,
                request.ProgramCode!,
                cancellationToken);

            var header = await dynamicDataService.GetByIdAsync(
                businessId,
                request.ProgramCode!,
                request.Id,
                cancellationToken);

            var table = await dbContext.MpBusinessEntityTables
                .AsNoTracking()
                .FirstOrDefaultAsync(x =>
                    x.BusinessId == businessId &&
                    x.EntityId == trxContext.DetailEntity.Id &&
                    !x.IsDelete,
                    cancellationToken);

            if (table is null)
                throw new InvalidOperationException(
                    $"Dynamic detail table for '{trxContext.DetailEntity.Name}' not found.");

            var actualTableName = await Mprt04TransactionHelper.ResolveActualTableNameAsync(
                dbContext,
                table.TableName,
                cancellationToken);

            var details = await QueryDetailsAsync(
                actualTableName,
                trxContext.DetailField,
                request.Id,
                businessId,
                cancellationToken);

            return new Response
            {
                Id = request.Id,
                Header = header,
                Details = details.Select(x => new DetailRow
                {
                    Id = GetGuid(x, "id"),
                    State = 0,
                    Data = x
                }).ToList()
            };
        }

        private async Task<List<Dictionary<string, object?>>> QueryDetailsAsync(
            string tableName,
            string detailField,
            Guid headerId,
            Guid businessId,
            CancellationToken cancellationToken)
        {
            var sql = $"""
                select *
                from {Mprt04TransactionHelper.Quote(tableName)}
                where {Mprt04TransactionHelper.Quote(detailField)} = @header_id
                  and {Mprt04TransactionHelper.Quote("business_id")} = @business_id
                  and {Mprt04TransactionHelper.Quote("is_delete")} = false
                order by {Mprt04TransactionHelper.Quote("id")} asc
                """;

            var connection = dbContext.Database.GetDbConnection();

            await using var command = connection.CreateCommand();
            command.CommandText = sql;
            command.Parameters.Add(new NpgsqlParameter("header_id", headerId));
            command.Parameters.Add(new NpgsqlParameter("business_id", businessId));

            if (connection.State != ConnectionState.Open)
                await connection.OpenAsync(cancellationToken);

            await using var reader = await command.ExecuteReaderAsync(cancellationToken);

            var rows = new List<Dictionary<string, object?>>();

            while (await reader.ReadAsync(cancellationToken))
            {
                var row = new Dictionary<string, object?>(StringComparer.OrdinalIgnoreCase);

                for (var i = 0; i < reader.FieldCount; i++)
                {
                    row[reader.GetName(i)] = reader.IsDBNull(i)
                        ? null
                        : reader.GetValue(i);
                }

                rows.Add(row);
            }

            return rows;
        }

        private static Guid? GetGuid(Dictionary<string, object?> row, string key)
        {
            if (!row.TryGetValue(key, out var value) || value is null)
                return null;

            if (value is Guid guid)
                return guid;

            if (Guid.TryParse(value.ToString(), out var parsed))
                return parsed;

            return null;
        }
    }
}