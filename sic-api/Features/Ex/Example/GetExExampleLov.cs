using MediatR;
using Microsoft.EntityFrameworkCore;
using sic_api.Data;
using sic_api.Entities.Ex;
using sic_api.Extensions;
using sic_api.Model;
using sic_api.Services.Interfaces;

namespace sic_api.Features.Ex.Example;

public static class GetExExampleLov
{
    public class Query :Pageable, IRequest<PaginationBase<LovBase>>
    {
        public string? Keyword { get; set; }
        public Guid? Value { get; set; }
    }

    public sealed class Handler(
        SicDbContext dbContext,
        IRequestLanguageProvider requestLanguageProvider) : IRequestHandler<Query, PaginationBase<LovBase>>
    {
        public async Task<PaginationBase<LovBase>> Handle(Query request, CancellationToken cancellationToken)
        {


            var useEnglish = requestLanguageProvider.UseEnglish();
            var pageNumber = request.PageNumber <= 0 ? 1 : request.PageNumber;
            var pageSize = request.PageSize <= 0 ? 10 : request.PageSize;
            var keyword = request.Keyword?.Trim();
            var value = request.Value;

            IQueryable<ExExample> query = dbContext.ExExamples.AsNoTracking();
            query = ApplyKeyword(query, keyword, value);
            query = query.ApplySorting(request.Sorts, x => x.ExampleCode);

            var totalElements = await query.LongCountAsync(cancellationToken);
            var data = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(x => new LovBase
                {
                    Value = x.Id,
                    Text = String.Concat(x.ExampleCode, " - ", useEnglish ? x.MessageEn : x.MessageLocal)
                })
                .ToArrayAsync(cancellationToken);

            return new PaginationBase<LovBase>
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

        private static IQueryable<ExExample> ApplyKeyword(IQueryable<ExExample> query, string? keyword, Guid? value)
        {
            if (value.HasValue)
            {
                return query.Where(x => x.Id == value.Value);
            }

            if (!string.IsNullOrWhiteSpace(keyword))
            {
                return query.Where(x =>
                EF.Functions.ILike(x.ExampleCode, $"%{keyword}%") ||
                EF.Functions.ILike(x.MessageEn, $"%{keyword}%") ||
                EF.Functions.ILike(x.MessageLocal, $"%{keyword}%"));
            }
            return query;
                

        }
    }
}
