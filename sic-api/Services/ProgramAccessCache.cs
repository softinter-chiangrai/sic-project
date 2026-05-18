using System.Collections.Concurrent;
using Microsoft.Extensions.Caching.Memory;
using sic_api.Services.Interfaces;

namespace sic_api.Services;

public class ProgramAccessCache(IMemoryCache memoryCache) : IProgramAccessCache
{
    private readonly ConcurrentDictionary<string, byte> keys = new();

    public Task<HashSet<string>> GetOrCreateAsync(
        string userId,
        Guid businessId,
        Func<Task<HashSet<string>>> factory)
    {
        var cacheKey = BuildCacheKey(userId, businessId);

        return memoryCache.GetOrCreateAsync(
            cacheKey,
            async entry =>
            {
                entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(10);
                keys.TryAdd(cacheKey, 0);
                return await factory();
            })!;
    }

    public void Remove(string userId, Guid businessId)
    {
        var cacheKey = BuildCacheKey(userId, businessId);
        memoryCache.Remove(cacheKey);
        keys.TryRemove(cacheKey, out _);
    }

    public void RemoveByBusiness(Guid businessId)
    {
        var prefix = $"{KeyPrefix}:{Normalize(businessId.ToString())}:";
        var cacheKeys = keys.Keys
            .Where(x => x.StartsWith(prefix, StringComparison.OrdinalIgnoreCase))
            .ToArray();

        foreach (var cacheKey in cacheKeys)
        {
            memoryCache.Remove(cacheKey);
            keys.TryRemove(cacheKey, out _);
        }
    }

    public void RemoveAll()
    {
        foreach (var cacheKey in keys.Keys.ToArray())
        {
            memoryCache.Remove(cacheKey);
            keys.TryRemove(cacheKey, out _);
        }
    }

    private static string BuildCacheKey(string userId, Guid businessId) =>
        $"{KeyPrefix}:{Normalize(businessId.ToString())}:{Normalize(userId)}";

    private static string Normalize(string? value) =>
        string.IsNullOrWhiteSpace(value) ? string.Empty : value.Trim().ToLowerInvariant();

    private const string KeyPrefix = "program-access";
}
