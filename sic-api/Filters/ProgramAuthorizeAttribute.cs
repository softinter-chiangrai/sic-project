using Microsoft.AspNetCore.Mvc;

namespace sic_api.Filters;

[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = true, Inherited = true)]
public sealed class ProgramAuthorizeAttribute : TypeFilterAttribute
{
    public ProgramAuthorizeAttribute(string programCode) : base(typeof(ProgramAuthorizeFilter))
    {
        Arguments = [programCode];
    }
}
