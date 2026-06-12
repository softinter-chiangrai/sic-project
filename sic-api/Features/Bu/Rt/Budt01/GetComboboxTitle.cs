using MediatR;
using Microsoft.EntityFrameworkCore;
using sic_api.Data;
using sic_api.Entities.Db;
using sic_api.Extensions;
using sic_api.Model;
using sic_api.Services.Interfaces;

namespace sic_api.Features.Bu.Rt.Budt01;

public static class GetComboboxTitle
{
    public class Query :PageableCombobox, IRequest<PaginationBase<LovBase>>
    {
        public string? PersonType { get; set; }
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

            IQueryable<DbTitle> query = dbContext.DbTitles.AsNoTracking();
            query = ApplyKeyword(query, keyword, value, request.PersonType);
            query = query.ApplySorting(request.Sorts, x => x.SortOrder);

            var totalElements = await query.LongCountAsync(cancellationToken);
            var data = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(x => new LovBase
                {
                    Value = x.Id,
                    Text = useEnglish ? (x.PrefixNameEn + (x.SuffixNameEn != "-" ? ( " " + x.SuffixNameEn):"")) : (x.PrefixNameLocal + (x.SuffixNameLocal != "-" ? " " + x.SuffixNameLocal : ""))
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

        private static IQueryable<DbTitle> ApplyKeyword(IQueryable<DbTitle> query, string? keyword, Guid? value, string? personType)
        {
            if (value.HasValue)
            {
                return query.Where(x => x.Id == value.Value);
            }

            if (!string.IsNullOrWhiteSpace(personType))
            {
                query = query.Where(x => x.PersonType == personType);
            }

            if (!string.IsNullOrWhiteSpace(keyword))
            {
                return query.Where(x =>
                EF.Functions.ILike(x.PrefixNameEn, $"%{keyword}%") ||
                EF.Functions.ILike(x.SuffixNameEn ?? "", $"%{keyword}%") ||
                EF.Functions.ILike(x.PrefixNameLocal, $"%{keyword}%") ||
                EF.Functions.ILike(x.SuffixNameLocal ?? "", $"%{keyword}%"));
            }
            return query;
                

        }
    }
}
