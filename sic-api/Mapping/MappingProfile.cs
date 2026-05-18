using AutoMapper;
using System.Reflection;

namespace sic_api.Mapping;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        ApplyMappingsFromAssembly(Assembly.GetExecutingAssembly());
    }

    private void ApplyMappingsFromAssembly(Assembly assembly)
    {
        var types = assembly.GetExportedTypes()
            .Where(type => type.GetInterfaces()
                .Any(@interface => @interface.IsGenericType &&
                                   @interface.GetGenericTypeDefinition() == typeof(IMapFrom<>)))
            .ToList();

        foreach (var type in types)
        {
            var instance = Activator.CreateInstance(type);
            var methodInfo = type.GetMethod(nameof(IMapFrom<object>.Mapping))
                             ?? type.GetInterfaceMap(type.GetInterfaces()
                                 .First(@interface => @interface.IsGenericType &&
                                                     @interface.GetGenericTypeDefinition() == typeof(IMapFrom<>)))
                                 .TargetMethods
                                 .FirstOrDefault(method => method.Name == nameof(IMapFrom<object>.Mapping));

            methodInfo?.Invoke(instance, [this]);
        }
    }
}
