using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using sic_api.Data;

namespace sic_api.Features.Marketplace.Mprt04;

public static class GetMprt04DetailSchema
{
    public class Query : IRequest<Response>
    {
        public string? ProgramCode { get; set; }
    }

    public class Response
    {
        public EntityResponse Entity { get; set; } = new();
    }

    public class EntityResponse
    {
        public Guid Id { get; set; }

        public string Name { get; set; } = default!;

        public string LabelEn { get; set; } = default!;

        public string LabelLocal { get; set; } = default!;

        public List<FieldResponse> Fields { get; set; } = [];
    }

    public class FieldResponse
    {
        public string Name { get; set; } = default!;

        public string Field { get; set; } = default!;

        public string Type { get; set; } = default!;

        public string? Format { get; set; }

        public bool Require { get; set; }

        public string? ReferenceEntity { get; set; }

        public string LabelEn { get; set; } = default!;

        public string LabelLocal { get; set; } = default!;

        public int SeqNo { get; set; }
    }

    public class Validator : AbstractValidator<Query>
    {
        public Validator()
        {
            RuleFor(x => x.ProgramCode).NotEmpty();
        }
    }

    public sealed class Handler(SicDbContext dbContext)
        : IRequestHandler<Query, Response>
    {
        public async Task<Response> Handle(
            Query request,
            CancellationToken cancellationToken)
        {
            var trxContext = await Mprt04TransactionHelper.GetTransactionContextAsync(
                dbContext,
                request.ProgramCode!,
                cancellationToken);

            var detailEntity = await dbContext.MpEntities
                .AsNoTracking()
                .Include(x => x.Fields)
                .FirstAsync(x =>
                    x.Id == trxContext.DetailEntity.Id &&
                    !x.IsDelete,
                    cancellationToken);

            return new Response
            {
                Entity = new EntityResponse
                {
                    Id = detailEntity.Id,
                    Name = detailEntity.Name,
                    LabelEn = detailEntity.LabelEn,
                    LabelLocal = detailEntity.LabelLocal,
                    Fields = detailEntity.Fields
                        .Where(x => !x.IsDelete)
                        .OrderBy(x => x.SeqNo)
                        .Select(x => new FieldResponse
                        {
                            Name = x.Name,
                            Field = x.Field,
                            Type = x.Type,
                            Format = x.Format,
                            Require = x.IsRequired,
                            ReferenceEntity = x.ReferenceEntity,
                            LabelEn = x.LabelEn,
                            LabelLocal = x.LabelLocal,
                            SeqNo = x.SeqNo
                        })
                        .ToList()
                }
            };
        }
    }
}