using MediatR;
using Microsoft.EntityFrameworkCore;
using sic_api.Data;
using sic_api.Services.Interfaces;

namespace sic_api.Features.Auth.Business;

public static class GetInvites
{
    public sealed class Response
    {
        public Guid Id { get; set; }
        public string InviteType { get; set; } = default!;
        public string? InviteEmail { get; set; }
        public string? InviteToken { get; set; }
        public Guid RoleId { get; set; }
        public string RoleCode { get; set; } = default!;
        public string RoleName { get; set; } = default!;
        public bool IsActivated { get; set; }
        public int? MaxUses { get; set; }
        public int UseCount { get; set; }
        public DateTime CreatedDate { get; set; }
    }

    public sealed class Query : IRequest<List<Response>>
    {
    }

    public sealed class Handler(
        SicDbContext db,
        ICurrentUserService currentUser,
        IBusinessAccessService businessAccess) : IRequestHandler<Query, List<Response>>
    {
        public async Task<List<Response>> Handle(Query request, CancellationToken cancellationToken)
        {
            var userId = currentUser.GetUserId();
            var businessId = businessAccess.GetBusinessId();

            // Verify caller belongs to the active business
            var isMember = await db.SuUserBusinesses
                .AnyAsync(x => x.UserId == userId && x.BusinessId == businessId && x.IsActive,
                    cancellationToken);
            if (!isMember) return [];

            return await db.SuBusinessInvites
                .AsNoTracking()
                .Where(x => x.SuBusinessRole.BusinessId == businessId && !x.IsDelete)
                .OrderByDescending(x => x.CreatedDate)
                .Select(x => new Response
                {
                    Id = x.Id,
                    InviteType = x.InviteType,
                    InviteEmail = x.InviteEmail,
                    InviteToken = x.InviteToken,
                    RoleId = x.RoleId,
                    RoleCode = x.SuBusinessRole.RoleCode,
                    RoleName = x.SuBusinessRole.RoleNameLocal,
                    IsActivated = x.IsActivated,
                    MaxUses = x.MaxUses,
                    UseCount = x.UseCount,
                    CreatedDate = x.CreatedDate,
                })
                .ToListAsync(cancellationToken);
        }
    }
}
