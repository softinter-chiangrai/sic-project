using sic_api.Services.Interfaces;

namespace sic_api.Services;

public class RequestLanguageProvider(IHttpContextAccessor httpContextAccessor) : IRequestLanguageProvider
{
    public const string LanguageCodeHeaderName = "X-Language-Code";

    public string? GetLanguageCode()
    {
        var httpContext = httpContextAccessor.HttpContext;
        if (httpContext is null)
        {
            return null;
        }

        var headerLanguageCode = httpContext.Request.Headers[LanguageCodeHeaderName].ToString();
        if (!string.IsNullOrWhiteSpace(headerLanguageCode))
        {
            return headerLanguageCode;
        }

        return null;
    }

    public bool UseEnglish()
    {
        var languageCode = GetLanguageCode();
        return string.IsNullOrWhiteSpace(languageCode) ||
               string.Equals(languageCode, "en", StringComparison.OrdinalIgnoreCase);
    }
}
