using sic_api.Model;
using System.Linq.Expressions;

namespace sic_api.Extensions;

public static class QueryableExtensions
{
    public static IQueryable<T> ApplySorting<T, TDefaultKey>(
        this IQueryable<T> query,
        PageableSort[] sorts,
        Expression<Func<T, TDefaultKey>> defaultSort)
    {
        if (sorts.Length == 0)
        {
            return query.OrderBy(defaultSort);
        }

        IOrderedQueryable<T>? orderedQuery = null;

        foreach (var sort in sorts.Where(x => !string.IsNullOrWhiteSpace(x.Field)))
        {
            var parameter = Expression.Parameter(typeof(T), "x");
            var property = Expression.PropertyOrField(parameter, sort.Field);
            var lambda = Expression.Lambda(property, parameter);

            var methodName = orderedQuery is null
                ? (sort.Descending ? nameof(Queryable.OrderByDescending) : nameof(Queryable.OrderBy))
                : (sort.Descending ? nameof(Queryable.ThenByDescending) : nameof(Queryable.ThenBy));

            var method = typeof(Queryable)
                .GetMethods()
                .Single(m =>
                    m.Name == methodName &&
                    m.GetParameters().Length == 2)
                .MakeGenericMethod(typeof(T), property.Type);

            orderedQuery = (IOrderedQueryable<T>)method.Invoke(null, [orderedQuery ?? query, lambda])!;
        }

        return orderedQuery ?? query.OrderBy(defaultSort);
    }
}
