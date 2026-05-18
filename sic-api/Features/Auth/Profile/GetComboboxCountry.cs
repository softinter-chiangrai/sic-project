using MediatR;
using Microsoft.EntityFrameworkCore;
using sic_api.Data;
using sic_api.Entities.Db;
using sic_api.Extensions;
using sic_api.Model;
using sic_api.Services.Interfaces;

namespace sic_api.Features.Auth.Profile;

public static class GetComboboxCountry
{
    public class Query :PageableCombobox, IRequest<PaginationBase<Response>>
    {
        
    }

    public class Response : LovBase
    {
        public bool SupportLocalAddress { get; set; } = false;
    }

    public sealed class Handler(
        SicDbContext dbContext,
        IRequestLanguageProvider requestLanguageProvider) : IRequestHandler<Query, PaginationBase<Response>>
    {
        public async Task<PaginationBase<Response>> Handle(Query request, CancellationToken cancellationToken)
        {


            var useEnglish = requestLanguageProvider.UseEnglish();
            var pageNumber = request.PageNumber <= 0 ? 1 : request.PageNumber;
            var pageSize = request.PageSize <= 0 ? 10 : request.PageSize;
            var keyword = request.Keyword?.Trim();
            var value = request.Value;

            IQueryable<DbCountry> query = dbContext.DbCountries.AsNoTracking();
            query = ApplyKeyword(query, keyword, value);
            query = query.ApplySorting(request.Sorts, x => x.Id);

            var totalElements = await query.LongCountAsync(cancellationToken);
            var data = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(x => new Response
                {
                    Value = x.Id,
                    Text = useEnglish ? x.CountryNameEn: x.CountryNameLocal,
                    SupportLocalAddress = x.SupportLocalAddress
                })
                .ToArrayAsync(cancellationToken);

            return new PaginationBase<Response>
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

        private static IQueryable<DbCountry> ApplyKeyword(IQueryable<DbCountry> query, string? keyword, Guid? value)
        {
            if (value.HasValue)
            {
                return query.Where(x => x.Id == value.Value);
            }

            if (!string.IsNullOrWhiteSpace(keyword))
            {
                return query.Where(x =>
                EF.Functions.ILike(x.CountryCode, $"%{keyword}%") ||
                EF.Functions.ILike(x.CountryNameEn ?? "", $"%{keyword}%") ||
                EF.Functions.ILike(x.CountryNameLocal, $"%{keyword}%"));
            }
            return query;
        }
    }
}
