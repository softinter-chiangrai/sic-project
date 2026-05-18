using System;

namespace sic_api.Entities;

[AttributeUsage(AttributeTargets.Property, AllowMultiple = false, Inherited = true)]
public sealed class MessageAttribute : Attribute
{
    public MessageAttribute(string module, string responseFieldName)
    {
        Module = module;
        ResponseFieldName = responseFieldName;
    }
    public string Module { get; }
    public string ResponseFieldName { get; }
}
