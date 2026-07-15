using Microsoft.AspNetCore.Mvc;

namespace sic_api.Filters;

[AttributeUsage(AttributeTargets.Class, AllowMultiple = false, Inherited = true)]
public sealed class ProgramAuthorizeAttribute : TypeFilterAttribute
{
    public ProgramAuthorizeAttribute(string programCode) : base(typeof(ProgramAuthorizeFilter))
    {
        if (string.IsNullOrWhiteSpace(programCode))
        {
            throw new ArgumentException("Program code is required.", nameof(programCode));
        }

        ProgramCode = programCode;
        Arguments = [programCode];
    }

    public string ProgramCode { get; }
}