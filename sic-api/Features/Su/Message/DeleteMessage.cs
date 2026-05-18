using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using sic_api.Data;
using sic_api.Model;
using sic_api.Services.Interfaces;

namespace sic_api.Features.Su.Message;

public static class DeleteMessage
{
    public class Command : BaseModelState, IRequest<bool>
    {
        public Guid Id { get; set; }
    }

    public class Validator : AbstractValidator<Command>
    {
        public Validator()
        {
            RuleFor(x => x.Id).NotEmpty();
            RuleFor(x => x.RowVersion).NotNull();
        }
    }

    public sealed class Handler(SicDbContext dbContext, IMessageI18nCache messageI18nCache) : IRequestHandler<Command, bool>
    {
        public async Task<bool> Handle(Command request, CancellationToken cancellationToken)
        {
            var item = await dbContext.SuMessages
                .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);

            if (item is null)
            {
                return false;
            }

            dbContext.Entry(item).Property(x => x.RowVersion).OriginalValue = request.RowVersion!.Value;
            var moduleCode = item.ModuleCode;
            var programCode = item.ProgramCode;
            dbContext.SuMessages.Remove(item);
            await dbContext.SaveChangesAsync(cancellationToken);
            messageI18nCache.Remove(moduleCode, programCode);
            return true;
        }
    }
}
