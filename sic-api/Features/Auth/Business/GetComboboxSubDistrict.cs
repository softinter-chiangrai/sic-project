using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using sic_api.Data;
using sic_api.Entities.Db;
using sic_api.Extensions;
using sic_api.Model;
using sic_api.Services.Interfaces;

namespace sic_api.Features.Auth.Business;

public static class GetComboboxSubDistrict
{
    public class Query :PageableCombobox, IRequest<PaginationBase<Response>>
    {
        public Guid DistrictId { get; set; } = default!;
    }

    public class Response : LovBase
    {
        public string ZipCode { get; set; } = default!;
    }

    public class Validator : AbstractValidator<Query>
    {
        public Validator()
        {
            RuleFor(x => x.DistrictId).NotEmpty();
        }
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

            IQueryable<DbSubDistrict> query = dbContext.DbSubDistricts.AsNoTracking();
            query = ApplyKeyword(query, keyword, value, request.DistrictId);
            query = query.ApplySorting(request.Sorts, x => x.SubDistrictCode);

            var totalElements = await query.LongCountAsync(cancellationToken);
            var data = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(x => new Response
                {
                    Value = x.Id,
                    Text = useEnglish ? x.SubDistrictNameEn : x.SubDistrictNameLocal,
                    ZipCode = x.ZipCode
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

        private static IQueryable<DbSubDistrict> ApplyKeyword(IQueryable<DbSubDistrict> query, string? keyword, Guid? value, Guid districtId)
        {
            query = query.Where(x => x.DistrictId == districtId);

            if (value.HasValue)
            {
                return query.Where(x => x.Id == value.Value);
            }
            
            if (!string.IsNullOrWhiteSpace(keyword))
            {
                return query.Where(x =>
                EF.Functions.ILike(x.SubDistrictCode, $"%{keyword}%") ||
                EF.Functions.ILike(x.SubDistrictNameEn ?? "", $"%{keyword}%") ||
                EF.Functions.ILike(x.SubDistrictNameLocal ?? "", $"%{keyword}%"));
            }
            return query;
                

        }
    }
}
