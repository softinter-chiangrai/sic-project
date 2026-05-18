using Microsoft.EntityFrameworkCore;
using sic_api.Data;
using sic_api.Services.Interfaces;

namespace sic_api.Services;

public class ProgramAccessService(
    SicDbContext dbContext,
    ICurrentUserService currentUserService,
    IBusinessAccessService businessAccessService,
    IProgramAccessCache programAccessCache) : IProgramAccessService
{
    public async Task<bool> CanAccessProgramAsync(string programCode, CancellationToken cancellationToken = default)
    {
        var userId = currentUserService.GetUserId();
        var businessId = businessAccessService.GetBusinessId();

        if (businessId == Guid.Empty || string.IsNullOrWhiteSpace(programCode))
        {
            return false;
        }

        var accessiblePrograms = await programAccessCache.GetOrCreateAsync(
            userId,
            businessId,
            async () => await dbContext.SuUserBusinessRoles
                .AsNoTracking()
                .Where(x =>
                    x.IsActive &&
                    x.UserBusiness.IsActive &&
                    x.UserBusiness.KeycloakUserId == userId &&
                    x.UserBusiness.Business.IsActive &&
                    x.BusinessRole.IsActive)
                .SelectMany(x => x.BusinessRole.RolePrograms)
                .Where(x =>
                    x.IsActive &&
                    x.Program.IsActive)
                .Select(x => x.Program.ProgramCode)
                .Distinct()
                .ToHashSetAsync(cancellationToken));

        return accessiblePrograms.Contains(programCode);
    }

    public void RemoveAccessCache(string userId, Guid businessId)
    {
        programAccessCache.Remove(userId, businessId);
    }

    public void RemoveAccessCacheByBusiness(Guid businessId)
    {
        programAccessCache.RemoveByBusiness(businessId);
    }

    public void RemoveAllAccessCache()
    {
        programAccessCache.RemoveAll();
    }
}
