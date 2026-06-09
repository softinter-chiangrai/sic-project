using MediatR;
using Microsoft.EntityFrameworkCore;
using sic_api.Data;
using sic_api.Model;
using sic_api.Services.Interfaces;

namespace sic_api.Features.Auth.Business;

public static class GetRolesForBusiness
{
    public sealed class Query : IRequest<LovBase[]>
    {
    }

    public sealed class Handler(
        SicDbContext db,
        ICurrentUserService currentUser,
        IBusinessAccessService businessAccess) : IRequestHandler<Query, LovBase[]>
    {
        public async Task<LovBase[]> Handle(Query request, CancellationToken cancellationToken)
        {
            var userId = currentUser.GetUserId();
            var businessId = businessAccess.GetBusinessId();

            var isMember = await db.SuUserBusinesses
                .AnyAsync(x => x.UserId == userId && x.BusinessId == businessId && x.IsActive,
                    cancellationToken);
            if (!isMember) return [];

            return await db.SuBusinessRoles
                .AsNoTracking()
                .Where(r => r.BusinessId == businessId && !r.IsDelete && r.IsActive)
                .OrderBy(r => r.SortOrder)
                .ThenBy(r => r.RoleCode)
                .Select(r => new LovBase
                {
                    Value = r.Id,
                    Text = r.RoleCode + " - " + r.RoleNameLocal,
                })
                .ToArrayAsync(cancellationToken);
        }
    }
}
