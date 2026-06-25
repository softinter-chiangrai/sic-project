using System.Data;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using sic_api.Data;
using sic_api.Services.Interfaces;

namespace sic_api.Features.Marketplace.Mprt04;

public static class DeleteMprt04Transaction
{
    public class Command : IRequest<Response>
    {
        public string? ProgramCode { get; set; }

        public Guid Id { get; set; }
    }

    public class Response
    {
        public Guid Id { get; set; }

        public string Status { get; set; } = default!;
    }

    public class Validator : AbstractValidator<Command>
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

            await using var transaction = await dbContext.Database.BeginTransactionAsync(cancellationToken);

            await DeleteDetailsAsync(
                actualTableName,
                trxContext.DetailField,
                request.Id,
                businessId,
                cancellationToken);

            await dynamicDataService.DeleteAsync(
                businessId,
                request.ProgramCode!,
                request.Id,
                cancellationToken);

            await transaction.CommitAsync(cancellationToken);

            return new Response
            {
                Id = request.Id,
                Status = "DELETED"
            };
        }

        private async Task DeleteDetailsAsync(
            string tableName,
            string detailField,
            Guid headerId,
            Guid businessId,
            CancellationToken cancellationToken)
        {
            var now = DateTime.UtcNow;

            var sql = $"""
                update {Mprt04TransactionHelper.Quote(tableName)}
                set
                    {Mprt04TransactionHelper.Quote("is_delete")} = true,
                    {Mprt04TransactionHelper.Quote("delete_by")} = @delete_by,
                    {Mprt04TransactionHelper.Quote("delete_date")} = @delete_date,
                    {Mprt04TransactionHelper.Quote("updated_by")} = @updated_by,
                    {Mprt04TransactionHelper.Quote("updated_date")} = @updated_date
                where {Mprt04TransactionHelper.Quote(detailField)} = @header_id
                  and {Mprt04TransactionHelper.Quote("business_id")} = @business_id
                  and {Mprt04TransactionHelper.Quote("is_delete")} = false
                """;

            var connection = dbContext.Database.GetDbConnection();

            await using var command = connection.CreateCommand();
            command.CommandText = sql;
            command.Parameters.Add(new NpgsqlParameter("header_id", headerId));
            command.Parameters.Add(new NpgsqlParameter("business_id", businessId));
            command.Parameters.Add(new NpgsqlParameter("delete_by", "system"));
            command.Parameters.Add(new NpgsqlParameter("delete_date", now));
            command.Parameters.Add(new NpgsqlParameter("updated_by", "system"));
            command.Parameters.Add(new NpgsqlParameter("updated_date", now));

            if (connection.State != ConnectionState.Open)
                await connection.OpenAsync(cancellationToken);

            await command.ExecuteNonQueryAsync(cancellationToken);
        }
    }
}