namespace sic_api.Services.Interfaces;

public interface IProgramAccessService
{
    Task<bool> CanAccessProgramAsync(string programCode, CancellationToken cancellationToken = default);
    Task<bool> CanAccessProgramScopeAsync(string programCode,string scope, CancellationToken cancellationToken = default);
    void RemoveAccessCache(string userId, Guid businessId);
    void RemoveAccessCacheByBusiness(Guid businessId);
    void RemoveAllAccessCache();
}
