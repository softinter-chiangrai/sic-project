using Microsoft.AspNetCore.Mvc;

namespace sic_api.Filters;

[AttributeUsage(AttributeTargets.Method, AllowMultiple = false, Inherited = true)]
public sealed class ScopeAuthorizeAttribute : TypeFilterAttribute
{
    public ScopeAuthorizeAttribute(params string[] scopes)
        : base(typeof(ScopeAuthorizeFilter))
    {
        Scopes = scopes;
        Arguments = [scopes];
    }

    public string[] Scopes { get; }
}