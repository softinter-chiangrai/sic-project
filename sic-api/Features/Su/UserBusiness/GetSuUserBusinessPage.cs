using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using sic_api.Data;
using sic_api.Entities.Su;
using sic_api.Extensions;
using sic_api.Model;
using sic_api.Utility;

namespace sic_api.Features.Su.UserBusiness;

public static class GetSuUserBusinessPage
{
    public sealed class Response
    {
        public Guid Id { get; set; }
        public string KeycloakUserId { get; set; } = default!;
        public Guid BusinessId { get; set; }
        public string BusinessName { get; set; } = default!;
        public bool IsDefault { get; set; }
        public bool IsActive { get; set; }
        public uint RowVersion { get; set; }
    }

    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<SuUserBusiness, Response>();
        }
    }

    public class Query : Pageable, IRequest<PaginationBase<Response>>
    {
        public string? Keyword { get; set; }
    }

    public sealed class Handler(SicDbContext dbContext, IMapper mapper) : IRequestHandler<Query, PaginationBase<Response>>
    {
        public async Task<PaginationBase<Response>> Handle(Query request, CancellationToken cancellationToken)
        {
            var pageNumber = request.PageNumber <= 0 ? 1 : request.PageNumber;
            var pageSize = request.PageSize <= 0 ? 10 : request.PageSize;
            var keyword = request.Keyword?.Trim();

            var query = dbContext.SuUserBusinesses
                .AsNoTracking()
                .Include(x => x.Business)
                .ThenInclude(x => x.Title)
                .AsQueryable();

            query = ApplyKeyword(query, keyword);
            query = query.ApplySorting(request.Sorts, x => x.KeycloakUserId);

            var totalElements = await query.LongCountAsync(cancellationToken);
            var data = await query
                .ProjectTo<Response>(mapper.ConfigurationProvider)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
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

        private static IQueryable<SuUserBusiness> ApplyKeyword(IQueryable<SuUserBusiness> query, string? keyword)
        {
            if (string.IsNullOrWhiteSpace(keyword))
            {
                return query;
            }

            var loweredKeyword = keyword.ToLower();
            var hasBool = bool.TryParse(keyword, out var parsedBool);
            var hasDefaultKeyword = loweredKeyword is "default" or "not-default";
            var hasActiveKeyword = loweredKeyword is "active" or "inactive";

            return query.Where(x =>
                EF.Functions.ILike(x.KeycloakUserId, $"%{keyword}%") ||
                EF.Functions.ILike(
                    NameUtility.EfJoinName(x.Business.Title.PrefixNameEn, x.Business.FirstNameEn, x.Business.Title.SuffixNameEn),
                    $"%{keyword}%") ||
                EF.Functions.ILike(
                    NameUtility.EfJoinName(x.Business.Title.PrefixNameLocal, x.Business.FirstNameLocal, x.Business.Title.SuffixNameLocal),
                    $"%{keyword}%") ||
                (hasBool && (x.IsDefault == parsedBool || x.IsActive == parsedBool)) ||
                (hasDefaultKeyword && x.IsDefault == (loweredKeyword == "default")) ||
                (hasActiveKeyword && x.IsActive == (loweredKeyword == "active")));
        }
    }
}
