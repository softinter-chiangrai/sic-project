using MediatR;
using Microsoft.EntityFrameworkCore;
using sic_api.Data;
using sic_api.Services.Interfaces;

namespace sic_api.Features.Auth.Business;

public static class DeleteInvite
{
    public sealed class Command : IRequest
    {
        public Guid InviteId { get; set; }
    }

    public sealed class Handler(
        SicDbContext db,
        ICurrentUserService currentUser) : IRequestHandler<Command>
    {
        public async Task Handle(Command request, CancellationToken cancellationToken)
        {
            var userId = currentUser.GetUserId();

            var invite = await db.SuBusinessInvites
                .Include(x => x.SuBusinessRole)
                .FirstOrDefaultAsync(x => x.Id == request.InviteId && !x.IsDelete, cancellationToken)
                ?? throw new KeyNotFoundException("Invite not found.");

            // Only a member of the business may revoke an invite
            var isMember = await db.SuUserBusinesses
                .AnyAsync(x => x.UserId == userId
                               && x.BusinessId == invite.SuBusinessRole.BusinessId
                               && x.IsActive, cancellationToken);
            if (!isMember)
                throw new UnauthorizedAccessException("You are not a member of the specified business.");

            invite.IsDelete = true;
            invite.DeleteBy = userId;
            invite.DeleteDate = DateTime.UtcNow;

            await db.SaveChangesAsync(cancellationToken);
        }
    }
}
