using System.Collections.Concurrent;
using Microsoft.Extensions.Caching.Memory;
using sic_api.Services.Interfaces;

namespace sic_api.Services;

public class MessageI18nCache(IMemoryCache memoryCache) : IMessageI18nCache
{
    private readonly ConcurrentDictionary<string, byte> keys = new();

    public Task<TItem> GetOrCreateAsync<TItem>(
        string moduleCode,
        string programCode,
        string languageCode,
        Func<Task<TItem>> factory)
    {
        var normalizedLanguageCode = Normalize(languageCode);
        var cacheKey = BuildCacheKey(moduleCode, programCode, normalizedLanguageCode);

        return memoryCache.GetOrCreateAsync(
            cacheKey,
            async entry =>
            {
                entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(30);
                keys.TryAdd(cacheKey, 0);
                return await factory();
            })!;
    }

    public void Remove(string moduleCode, string programCode)
    {
        var prefix = BuildPrefix(moduleCode, programCode);
        var cacheKeys = keys.Keys.Where(x => x.StartsWith(prefix, StringComparison.OrdinalIgnoreCase)).ToArray();

        foreach (var cacheKey in cacheKeys)
        {
            memoryCache.Remove(cacheKey);
            keys.TryRemove(cacheKey, out _);
        }
    }

    private static string BuildCacheKey(string moduleCode, string programCode, string languageCode) =>
        $"{BuildPrefix(moduleCode, programCode)}:{languageCode}";

    private static string BuildPrefix(string moduleCode, string programCode) =>
        $"i18n:{Normalize(moduleCode)}:{Normalize(programCode)}";

    private static string Normalize(string? value) =>
        string.IsNullOrWhiteSpace(value) ? "en" : value.Trim().ToLowerInvariant();
}
