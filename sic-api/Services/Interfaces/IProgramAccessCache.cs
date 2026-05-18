namespace sic_api.Services.Interfaces;

public interface IProgramAccessCache
{
    Task<HashSet<string>> GetOrCreateAsync(
        string userId,
        Guid businessId,
        Func<Task<HashSet<string>>> factory);

    void Remove(string userId, Guid businessId);
    void RemoveByBusiness(Guid businessId);
    void RemoveAll();
}
