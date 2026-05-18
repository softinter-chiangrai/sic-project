namespace sic_api.Services.Interfaces;

public interface IRequestLanguageProvider
{
    string? GetLanguageCode();
    bool UseEnglish();
}
