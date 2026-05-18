using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using sic_api.Data;
using sic_api.Entities.Db;
using sic_api.Extensions;
using sic_api.Model;
using sic_api.Services.Interfaces;

namespace sic_api.Features.Auth.Business;

public static class GetComboboxProvince
{
    public class Query :PageableCombobox, IRequest<PaginationBase<LovBase>>
    {
        public Guid CountryId { get; set; } = default!;
    }

    public class Validator : AbstractValidator<Query>
    {
        public Validator()
        {
            RuleFor(x => x.CountryId).NotEmpty();
        }
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

            IQueryable<DbProvince> query = dbContext.DbProvinces.AsNoTracking();
            query = ApplyKeyword(query, keyword, value, request.CountryId);
            query = query.ApplySorting(request.Sorts, x => x.ProvinceCode);

            var totalElements = await query.LongCountAsync(cancellationToken);
            var data = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(x => new LovBase
                {
                    Value = x.Id,
                    Text = useEnglish ? x.ProvinceNameEn : x.ProvinceNameLocal
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

        private static IQueryable<DbProvince> ApplyKeyword(IQueryable<DbProvince> query, string? keyword, Guid? value, Guid countryId)
        {
            query = query.Where(x => x.CountryId == countryId);

            if (value.HasValue)
            {
                return query.Where(x => x.Id == value.Value);
            }
            
            if (!string.IsNullOrWhiteSpace(keyword))
            {
                return query.Where(x =>
                EF.Functions.ILike(x.ProvinceCode, $"%{keyword}%") ||
                EF.Functions.ILike(x.ProvinceNameEn ?? "", $"%{keyword}%") ||
                EF.Functions.ILike(x.ProvinceNameLocal ?? "", $"%{keyword}%"));
            }
            return query;
                

        }
    }
}
