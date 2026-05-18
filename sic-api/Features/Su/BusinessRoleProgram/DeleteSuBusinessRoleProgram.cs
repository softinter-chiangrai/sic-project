using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using sic_api.Data;
using sic_api.Model;
using sic_api.Services.Interfaces;

namespace sic_api.Features.Su.BusinessRoleProgram;

public static class DeleteSuBusinessRoleProgram
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
            var item = await dbContext.SuBusinessRolePrograms
                .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);

            if (item is null)
            {
                return false;
            }

            var businessRoleId = item.BusinessRoleId;
            dbContext.Entry(item).Property(x => x.RowVersion).OriginalValue = request.RowVersion!.Value;
            dbContext.SuBusinessRolePrograms.Remove(item);
            await dbContext.SaveChangesAsync(cancellationToken);
            await SaveSuBusinessRoleProgram.InvalidateAccessCacheAsync(dbContext, programAccessService, businessRoleId, cancellationToken);
            return true;
        }
    }
}
