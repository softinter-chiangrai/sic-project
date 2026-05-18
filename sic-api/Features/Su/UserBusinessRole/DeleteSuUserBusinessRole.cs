using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using sic_api.Data;
using sic_api.Model;
using sic_api.Services.Interfaces;

namespace sic_api.Features.Su.UserBusinessRole;

public static class DeleteSuUserBusinessRole
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

    public sealed class Handler(
        SicDbContext dbContext,
        IProgramAccessService programAccessService) : IRequestHandler<Command, bool>
    {
        public async Task<bool> Handle(Command request, CancellationToken cancellationToken)
        {
            var item = await dbContext.SuUserBusinessRoles
                .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);

            if (item is null)
            {
                return false;
            }

            var userBusinessId = item.UserBusinessId;
            dbContext.Entry(item).Property(x => x.RowVersion).OriginalValue = request.RowVersion!.Value;
            dbContext.SuUserBusinessRoles.Remove(item);
            await dbContext.SaveChangesAsync(cancellationToken);
            await SaveSuUserBusinessRole.InvalidateAccessCacheAsync(dbContext, programAccessService, userBusinessId, cancellationToken);
            return true;
        }
    }
}
