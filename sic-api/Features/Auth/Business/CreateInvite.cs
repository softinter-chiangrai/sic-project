using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using sic_api.Data;
using sic_api.Entities.Su;
using sic_api.Services.Interfaces;
using System.Security.Cryptography;

namespace sic_api.Features.Auth.Business;

public static class CreateInvite
{
    public sealed class Command : IRequest<Guid>
    {
        public Guid RoleId { get; set; }
        /// <summary>"email" or "token"</summary>
        public string InviteType { get; set; } = default!;
        /// <summary>Email invite only.</summary>
        public string? InviteEmail { get; set; }
        /// <summary>Token invite only — null = unlimited.</summary>
        public int? MaxUses { get; set; }
    }

    public sealed class Validator : AbstractValidator<Command>
    {
        public Validator()
        {
            RuleFor(x => x.RoleId).NotEmpty();
            RuleFor(x => x.InviteType).Must(t => t == "email" || t == "token")
                .WithMessage("InviteType must be 'email' or 'token'");
            When(x => x.InviteType == "email", () =>
            {
                RuleFor(x => x.InviteEmail).NotEmpty().EmailAddress().MaximumLength(320);
            });
            When(x => x.InviteType == "token", () =>
            {
                RuleFor(x => x.MaxUses).GreaterThan(0).When(x => x.MaxUses.HasValue);
            });
        }
    }

    public sealed class Handler(
        SicDbContext db,
        ICurrentUserService currentUser,
        IBusinessAccessService businessAccess) : IRequestHandler<Command, Guid>
    {
        public async Task<Guid> Handle(Command request, CancellationToken cancellationToken)
        {
            var userId = currentUser.GetUserId();
            var businessId = businessAccess.GetBusinessId();

            // Verify role belongs to the active business
            var roleExists = await db.SuBusinessRoles
                .AnyAsync(r => r.Id == request.RoleId && r.BusinessId == businessId && !r.IsDelete,
                    cancellationToken);
            if (!roleExists)
                throw new InvalidOperationException("Role not found in the active business.");

            // Verify caller is a member of the active business
            var isMember = await db.SuUserBusinesses
                .AnyAsync(x => x.UserId == userId && x.BusinessId == businessId && x.IsActive,
                    cancellationToken);
            if (!isMember)
                throw new UnauthorizedAccessException("You are not a member of the active business.");

            var token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(24))
                .Replace('+', '-').Replace('/', '_').TrimEnd('=');

            var invite = new SuBusinessInvite
            {
                Id = Guid.NewGuid(),
                RoleId = request.RoleId,
                InviteType = request.InviteType,
                InviteEmail = request.InviteType == "email" ? request.InviteEmail : null,
                InviteToken = token,
                MaxUses = request.InviteType == "token" ? request.MaxUses : 1,
                UseCount = 0,
                IsActivated = false,
                CreatedBy = userId,
                CreatedDate = DateTime.UtcNow,
            };

            db.SuBusinessInvites.Add(invite);
            await db.SaveChangesAsync(cancellationToken);

            return invite.Id;
        }
    }
}
