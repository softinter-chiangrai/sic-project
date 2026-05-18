using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using sic_api.Data;
using sic_api.Model;

namespace sic_api.Features.Su.UserBusiness;

public static class DeleteSuUserBusiness
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

    public sealed class Handler(SicDbContext dbContext) : IRequestHandler<Command, bool>
    {
        public async Task<bool> Handle(Command request, CancellationToken cancellationToken)
        {
            var item = await dbContext.SuUserBusinesses
                .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);

            if (item is null)
            {
                return false;
            }

            dbContext.Entry(item).Property(x => x.RowVersion).OriginalValue = request.RowVersion!.Value;
            dbContext.SuUserBusinesses.Remove(item);
            await dbContext.SaveChangesAsync(cancellationToken);
            return true;
        }
    }
}
