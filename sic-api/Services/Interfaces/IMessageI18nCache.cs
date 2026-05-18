namespace sic_api.Services.Interfaces;

public interface IMessageI18nCache
{
    Task<TItem> GetOrCreateAsync<TItem>(
        string moduleCode,
        string programCode,
        string languageCode,
        Func<Task<TItem>> factory);

    void Remove(string moduleCode, string programCode);
}
