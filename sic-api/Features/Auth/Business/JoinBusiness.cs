using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using sic_api.Data;
using sic_api.Entities.Su;
using sic_api.Services.Interfaces;

namespace sic_api.Features.Auth.Business;

public static class JoinBusiness
{
    public sealed class Command : IRequest
    {
        public string Token { get; set; } = default!;
    }

    public sealed class Validator : AbstractValidator<Command>
    {
        public Validator()
        {
            RuleFor(x => x.Token).NotEmpty().MaximumLength(300);
        }
    }

    public sealed class Handler(
        SicDbContext db,
        ICurrentUserService currentUser) : IRequestHandler<Command>
    {
        public async Task Handle(Command request, CancellationToken cancellationToken)
        {
            var userId = currentUser.GetUserId();
            var userEmail = await currentUser.GetEmailAsync();

            var invite = await db.SuBusinessInvites
                .Include(x => x.SuBusinessRole)
                .FirstOrDefaultAsync(x => x.InviteToken == request.Token && !x.IsDelete, cancellationToken)
                ?? throw new KeyNotFoundException("Invite not found or has been revoked.");

            if (invite.InviteType == "email")
            {
                if (invite.IsActivated)
                    throw new InvalidOperationException("This email invite has already been used.");

                if (string.IsNullOrEmpty(userEmail) ||
                    !string.Equals(invite.InviteEmail, userEmail, StringComparison.OrdinalIgnoreCase))
                    throw new UnauthorizedAccessException("This invite is not valid for your account.");
            }
            else if (invite.InviteType == "token")
            {
                if (invite.MaxUses.HasValue && invite.UseCount >= invite.MaxUses.Value)
                    throw new InvalidOperationException("This invite has reached its usage limit.");
            }

            var businessId = invite.SuBusinessRole.BusinessId;

            // Check if user is already a member
            var existing = await db.SuUserBusinesses
                .FirstOrDefaultAsync(x => x.UserId == userId && x.BusinessId == businessId, cancellationToken);

            Guid userBusinessId;

            if (existing is null)
            {
                var isFirstBusiness = !await db.SuUserBusinesses.AnyAsync(x => x.UserId == userId, cancellationToken);

                var newMembership = new SuUserBusiness
                {
                    Id = Guid.NewGuid(),
                    UserId = userId,
                    BusinessId = businessId,
                    IsDefault = isFirstBusiness,
                    IsActive = true,
                    CreatedBy = userId,
                    CreatedDate = DateTime.UtcNow,
                };
                db.SuUserBusinesses.Add(newMembership);
                userBusinessId = newMembership.Id;
            }
            else
            {
                existing.IsActive = true;
                existing.UpdatedBy = userId;
                existing.UpdatedDate = DateTime.UtcNow;
                userBusinessId = existing.Id;
            }

            // Assign the role if not already assigned
            var hasRole = await db.SuUserBusinessRoles
                .AnyAsync(x => x.UserBusinessId == userBusinessId && x.BusinessRoleId == invite.RoleId, cancellationToken);

            if (!hasRole)
            {
                db.SuUserBusinessRoles.Add(new SuUserBusinessRole
                {
                    Id = Guid.NewGuid(),
                    UserBusinessId = userBusinessId,
                    BusinessRoleId = invite.RoleId,
                    IsPrimary = true,
                    IsActive = true,
                    CreatedBy = userId,
                    CreatedDate = DateTime.UtcNow,
                });
            }

            // Update invite usage
            if (invite.InviteType == "email")
            {
                invite.IsActivated = true;
            }
            invite.UseCount++;
            invite.UpdatedBy = userId;
            invite.UpdatedDate = DateTime.UtcNow;

            await db.SaveChangesAsync(cancellationToken);
        }
    }
}
