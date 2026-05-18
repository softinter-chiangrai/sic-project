using System.Collections;
using System.Reflection;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.EntityFrameworkCore;
using sic_api.Attributes;
using sic_api.Data;
using sic_api.Entities.Su;
using sic_api.Model.Storage;

namespace sic_api.Filters;

public sealed class StorageResponseFilter(SicDbContext dbContext) : IAsyncResultFilter
{
    public async Task OnResultExecutionAsync(ResultExecutingContext context, ResultExecutionDelegate next)
    {
        if (context.Result is ObjectResult { Value: not null } objectResult)
        {
            await EnrichResponseAsync(objectResult.Value, context.HttpContext.RequestAborted);
        }

        await next();
    }

    private async Task EnrichResponseAsync(object root, CancellationToken cancellationToken)
    {
        var bindings = new List<StorageBinding>();
        var visited = new HashSet<object>(ReferenceEqualityComparer.Instance);

        CollectBindings(root, bindings, visited);
        if (bindings.Count == 0)
        {
            return;
        }

        var groupIds = bindings
            .Where(item => item.GroupId.HasValue)
            .Select(item => item.GroupId!.Value)
            .Distinct()
            .ToArray();

        var uploadsByGroupId = groupIds.Length == 0
            ? new Dictionary<Guid, IReadOnlyList<StorageUploadReference>>()
            : await LoadUploadsAsync(groupIds, cancellationToken);

        foreach (var binding in bindings)
        {
            var uploads = binding.GroupId.HasValue && uploadsByGroupId.TryGetValue(binding.GroupId.Value, out var matchedUploads)
                ? matchedUploads
                : Array.Empty<StorageUploadReference>();

            binding.TargetProperty.SetValue(binding.Container, CreateTargetValue(binding.TargetProperty.PropertyType, uploads));
        }
    }

    private void CollectBindings(object current, ICollection<StorageBinding> bindings, ISet<object> visited)
    {
        if (ShouldSkipTraversal(current))
        {
            return;
        }

        if (TryTraverseEnumerable(current, bindings, visited))
        {
            return;
        }

        if (!visited.Add(current))
        {
            return;
        }

        foreach (var property in GetReadableProperties(current.GetType()))
        {
            AddBindingIfAnnotated(current, property, bindings);
            TraversePropertyValue(current, property, bindings, visited);
        }
    }

    private static StorageBinding CreateBinding(object container, PropertyInfo sourceProperty, StorageAttribute attribute)
    {
        var sourceType = Nullable.GetUnderlyingType(sourceProperty.PropertyType) ?? sourceProperty.PropertyType;
        if (sourceType != typeof(Guid))
        {
            throw new InvalidOperationException($"[Storage] can only be applied to Guid or Guid? properties. Invalid property: {sourceProperty.DeclaringType?.FullName}.{sourceProperty.Name}");
        }

        var targetProperty = container.GetType().GetProperty(attribute.ResponseFieldName, BindingFlags.Public | BindingFlags.Instance)
            ?? throw new InvalidOperationException($"Property '{attribute.ResponseFieldName}' was not found on type {container.GetType().FullName} for [Storage] annotation.");

        if (!targetProperty.CanWrite)
        {
            throw new InvalidOperationException($"Property '{attribute.ResponseFieldName}' on type {container.GetType().FullName} must be writable for [Storage] annotation.");
        }

        return new StorageBinding(container, targetProperty, ReadGroupId(container, sourceProperty));
    }

    private async Task<Dictionary<Guid, IReadOnlyList<StorageUploadReference>>> LoadUploadsAsync(
        IReadOnlyCollection<Guid> groupIds,
        CancellationToken cancellationToken)
    {
        var uploads = await dbContext.SuUploads
            .AsNoTracking()
            .Where(item => item.UploadGroupId.HasValue && groupIds.Contains(item.UploadGroupId.Value))
            .OrderBy(item => item.CreatedDate)
            .Select(item => MapUpload(item))
            .ToListAsync(cancellationToken);

        return uploads
            .GroupBy(item => item.UploadGroupId!.Value)
            .ToDictionary(group => group.Key, group => (IReadOnlyList<StorageUploadReference>)group.ToList());
    }

    private static StorageUploadReference MapUpload(SuUpload item)
    {
        return new StorageUploadReference
        {
            Id = item.Id,
            UploadGroupId = item.UploadGroupId,
            IsStreaming = item.IsStreaming,
            IsActive = item.IsActive,
            FileName = item.FileName,
            ContentType = item.ContentType,
            FileSize = item.FileSize,
            Visibility = item.Visibility.ToString(),
            AccessUrl = item.AccessUrl,
        };
    }

    private static object CreateTargetValue(Type targetType, IReadOnlyList<StorageUploadReference> uploads)
    {
        if (targetType == typeof(object))
        {
            return uploads.ToList();
        }

        if (targetType == typeof(StorageUploadReference[]))
        {
            return uploads.ToArray();
        }

        if (targetType == typeof(List<StorageUploadReference>) ||
            targetType == typeof(IReadOnlyList<StorageUploadReference>) ||
            targetType == typeof(IEnumerable<StorageUploadReference>) ||
            targetType == typeof(ICollection<StorageUploadReference>) ||
            targetType == typeof(IList<StorageUploadReference>))
        {
            return uploads.ToList();
        }

        if (targetType.IsAssignableFrom(typeof(List<StorageUploadReference>)))
        {
            return uploads.ToList();
        }

        throw new InvalidOperationException($"[Storage] target property type '{targetType.FullName}' is not supported. Use List<StorageUploadReference>, IReadOnlyList<StorageUploadReference>, IEnumerable<StorageUploadReference>, ICollection<StorageUploadReference>, IList<StorageUploadReference>, StorageUploadReference[] or object.");
    }

    private static bool IsTerminalType(Type type)
    {
        var actualType = Nullable.GetUnderlyingType(type) ?? type;
        return actualType.IsPrimitive ||
               actualType.IsEnum ||
               actualType == typeof(string) ||
               actualType == typeof(decimal) ||
               actualType == typeof(DateTime) ||
               actualType == typeof(DateTimeOffset) ||
               actualType == typeof(TimeSpan) ||
               actualType == typeof(Guid);
    }

    private static bool ShouldSkipTraversal(object current)
    {
        return IsTerminalType(current.GetType());
    }

    private bool TryTraverseEnumerable(object current, ICollection<StorageBinding> bindings, ISet<object> visited)
    {
        if (current is not IEnumerable enumerable || current is string)
        {
            return false;
        }

        foreach (var item in enumerable)
        {
            if (item is not null)
            {
                CollectBindings(item, bindings, visited);
            }
        }

        return true;
    }

    private static IEnumerable<PropertyInfo> GetReadableProperties(Type type)
    {
        return type
            .GetProperties(BindingFlags.Public | BindingFlags.Instance)
            .Where(property => property.CanRead && property.GetIndexParameters().Length == 0);
    }

    private static void AddBindingIfAnnotated(object current, PropertyInfo property, ICollection<StorageBinding> bindings)
    {
        var attribute = property.GetCustomAttribute<StorageAttribute>();
        if (attribute is null)
        {
            return;
        }

        bindings.Add(CreateBinding(current, property, attribute));
    }

    private void TraversePropertyValue(object current, PropertyInfo property, ICollection<StorageBinding> bindings, ISet<object> visited)
    {
        var value = property.GetValue(current);
        if (value is null || IsTerminalType(property.PropertyType))
        {
            return;
        }

        CollectBindings(value, bindings, visited);
    }

    private static Guid? ReadGroupId(object container, PropertyInfo sourceProperty)
    {
        var rawValue = sourceProperty.GetValue(container);
        return rawValue is Guid guid ? guid : null;
    }

    private sealed record StorageBinding(object Container, PropertyInfo TargetProperty, Guid? GroupId);
}