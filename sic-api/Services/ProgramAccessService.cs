using Microsoft.EntityFrameworkCore;
using sic_api.Data;
using sic_api.Entities.Su;
using sic_api.Filters;
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
                    x.UserBusiness.UserId == userId &&
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

    public async Task<bool> CanAccessProgramScopeAsync(string programCode, string scope, CancellationToken cancellationToken = default)
    {
        var userId = currentUserService.GetUserId();
        var businessId = businessAccessService.GetBusinessId();

        var query = BuildPermissionQuery(businessId, userId, programCode);

        return scope.ToUpperInvariant() switch
        {
            ProgramScopes.Back => await query.AnyAsync(x => x.RoleBack, cancellationToken),
            ProgramScopes.Search => await query.AnyAsync(x => x.RoleSearch, cancellationToken),
            ProgramScopes.Add => await query.AnyAsync(x => x.RoleAdd, cancellationToken),
            ProgramScopes.Save => await query.AnyAsync(x => x.RoleSave, cancellationToken),
            ProgramScopes.Remove => await query.AnyAsync(x => x.RoleDelete, cancellationToken),
            ProgramScopes.Print => await query.AnyAsync(x => x.RolePrint, cancellationToken),
            _ => false
        };
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

        private IQueryable<SuBusinessRoleProgram> BuildPermissionQuery(
        Guid businessId,
        string userId,
        string programCode)
    {
        return
            from ub in dbContext.SuUserBusinesses.AsNoTracking()
            join ubr in dbContext.SuUserBusinessRoles.AsNoTracking()
                on ub.Id equals ubr.UserBusinessId
            join br in dbContext.SuBusinessRoles.AsNoTracking()
                on ubr.BusinessRoleId equals br.Id
            join brp in dbContext.SuBusinessRolePrograms.AsNoTracking()
                on br.Id equals brp.BusinessRoleId
            join p in dbContext.SuPrograms.AsNoTracking()
                on brp.ProgramId equals p.Id
            where !ub.IsDelete
                  && !ubr.IsDelete
                  && !br.IsDelete
                  && !brp.IsDelete
                  && !p.IsDelete
                  && ub.IsActive
                  && ubr.IsActive
                  && br.IsActive
                  && brp.IsActive
                  && p.IsActive
                  && ub.BusinessId == businessId
                  && br.BusinessId == businessId
                  && ub.UserId == userId
                  && p.ProgramCode == programCode
            select brp;
    }
}
