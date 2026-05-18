using MediatR;
using Microsoft.EntityFrameworkCore;
using sic_api.Data;
using sic_api.Entities.Ex;
using sic_api.Extensions;
using sic_api.Model;

namespace sic_api.Features.Ex.Example;

public static class GetExExamplePage
{
    public class Query : Pageable, IRequest<PaginationBase<ExExample>>
    {
        public string? Keyword { get; set; }
    }

    public sealed class Handler(SicDbContext dbContext) : IRequestHandler<Query, PaginationBase<ExExample>>
    {
        public async Task<PaginationBase<ExExample>> Handle(Query request, CancellationToken cancellationToken)
        {
            var pageNumber = request.PageNumber <= 0 ? 1 : request.PageNumber;
            var pageSize = request.PageSize <= 0 ? 10 : request.PageSize;
            var keyword = request.Keyword?.Trim();

            IQueryable<ExExample> query = dbContext.ExExamples.AsNoTracking();
            query = ApplyKeyword(query, keyword);
            query = query.ApplySorting(request.Sorts, x => x.ExampleCode);

            var totalElements = await query.LongCountAsync(cancellationToken);
            var data = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToArrayAsync(cancellationToken);

            return new PaginationBase<ExExample>
            {
                Data = data,
                Pageable = new Pageable
                {
                    PageNumber = pageNumber,
                    PageSize = pageSize,
                    TotalElements = totalElements,
                    Sorts = request.Sorts
                }
            };
        }

        private static IQueryable<ExExample> ApplyKeyword(IQueryable<ExExample> query, string? keyword)
        {
            if (string.IsNullOrWhiteSpace(keyword))
            {
                return query;
            }

            var loweredKeyword = keyword.ToLower();
            var hasDate = DateTime.TryParse(keyword, out var parsedDate);
            var hasTotal = long.TryParse(keyword, out var parsedTotal);
            var hasBool = bool.TryParse(keyword, out var parsedBool);
            var hasActiveKeyword = loweredKeyword is "active" or "inactive";

            return query.Where(x =>
                EF.Functions.ILike(x.MessageEn, $"%{keyword}%") ||
                EF.Functions.ILike(x.MessageLocal, $"%{keyword}%") ||
                (hasDate && (x.StartDate.Date == parsedDate.Date || x.EndDate.Date == parsedDate.Date)) ||
                (hasTotal && x.Total == parsedTotal) ||
                (hasBool && x.IsActive == parsedBool) ||
                (hasActiveKeyword && x.IsActive == (loweredKeyword == "active")));
        }
    }
}
