using MediatR;
using Microsoft.EntityFrameworkCore;
using sic_api.Data;
using sic_api.Entities.Su;
using FluentValidation;

namespace sic_api.Features.Su.Message;

public static class GetMessages
{
    public class Query : IRequest<SuMessage[]>
    {
        public string? ModuleCode { get; set; }
        public string? ProgramCode { get; set; }
        public string? MessageCode { get; set; }
    }

    public class Validator : AbstractValidator<Query>
    {
        public Validator()
        {
            RuleFor(x => x.ModuleCode).MaximumLength(10);
            RuleFor(x => x.ProgramCode).MaximumLength(50);
            RuleFor(x => x.MessageCode).MaximumLength(50);
        }
    }

    public sealed class Handler(SicDbContext dbContext) : IRequestHandler<Query, SuMessage[]>
    {
        public async Task<SuMessage[]> Handle(Query request, CancellationToken cancellationToken)
        {
            var query = dbContext.SuMessages.AsNoTracking().AsQueryable();

            if (!string.IsNullOrWhiteSpace(request.ModuleCode))
            {
                query = query.Where(x => x.ModuleCode == request.ModuleCode);
            }

            if (!string.IsNullOrWhiteSpace(request.ProgramCode))
            {
                query = query.Where(x => x.ProgramCode == request.ProgramCode);
            }

            if (!string.IsNullOrWhiteSpace(request.MessageCode))
            {
                query = query.Where(x => x.MessageCode == request.MessageCode);
            }

            return await query
                .OrderBy(x => x.ModuleCode)
                .ThenBy(x => x.ProgramCode)
                .ThenBy(x => x.MessageCode)
                .ToArrayAsync(cancellationToken);
        }
    }
}
