using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using sic_api.Data;
using sic_api.Entities.Su;
using sic_api.Extensions;
using sic_api.Model;

namespace sic_api.Features.Su.UserBusinessRole;

public static class GetSuUserBusinessRolePage
{
    public sealed class Response
    {
        public Guid Id { get; set; }
        public Guid UserBusinessId { get; set; }
        public string KeycloakUserId { get; set; } = default!;
        public Guid BusinessId { get; set; }
        public Guid BusinessRoleId { get; set; }
        public string RoleCode { get; set; } = default!;
        public string RoleNameEn { get; set; } = default!;
        public string RoleNameLocal { get; set; } = default!;
        public bool IsPrimary { get; set; }
        public bool IsActive { get; set; }
        public uint RowVersion { get; set; }
    }

    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<SuUserBusinessRole, Response>()
                .ForMember(destination => destination.KeycloakUserId, options => options.MapFrom(source => source.UserBusiness.KeycloakUserId))
                .ForMember(destination => destination.BusinessId, options => options.MapFrom(source => source.UserBusiness.BusinessId))
                .ForMember(destination => destination.RoleCode, options => options.MapFrom(source => source.BusinessRole.RoleCode))
                .ForMember(destination => destination.RoleNameEn, options => options.MapFrom(source => source.BusinessRole.RoleNameEn))
                .ForMember(destination => destination.RoleNameLocal, options => options.MapFrom(source => source.BusinessRole.RoleNameLocal));
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

            var query = GetAllSuUserBusinessRoles.BuildQuery(dbContext);
            query = ApplyKeyword(query, keyword);
            query = query.ApplySorting(request.Sorts, x => x.UserBusiness.KeycloakUserId);

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

        private static IQueryable<Entities.Su.SuUserBusinessRole> ApplyKeyword(IQueryable<Entities.Su.SuUserBusinessRole> query, string? keyword)
        {
            if (string.IsNullOrWhiteSpace(keyword))
            {
                return query;
            }

            var loweredKeyword = keyword.ToLower();
            var hasBool = bool.TryParse(keyword, out var parsedBool);
            var hasPrimaryKeyword = loweredKeyword is "primary" or "secondary";
            var hasActiveKeyword = loweredKeyword is "active" or "inactive";

            return query.Where(x =>
                EF.Functions.ILike(x.UserBusiness.KeycloakUserId, $"%{keyword}%") ||
                EF.Functions.ILike(x.BusinessRole.RoleCode, $"%{keyword}%") ||
                EF.Functions.ILike(x.BusinessRole.RoleNameEn, $"%{keyword}%") ||
                EF.Functions.ILike(x.BusinessRole.RoleNameLocal, $"%{keyword}%") ||
                (hasBool && (x.IsPrimary == parsedBool || x.IsActive == parsedBool)) ||
                (hasPrimaryKeyword && x.IsPrimary == (loweredKeyword == "primary")) ||
                (hasActiveKeyword && x.IsActive == (loweredKeyword == "active")));
        }
    }
}
