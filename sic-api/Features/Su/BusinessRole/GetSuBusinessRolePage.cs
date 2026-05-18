using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using sic_api.Data;
using sic_api.Entities.Su;
using sic_api.Extensions;
using sic_api.Model;

namespace sic_api.Features.Su.BusinessRole;

public static class GetSuBusinessRolePage
{
    public sealed class Response
    {
        public Guid Id { get; set; }
        public Guid BusinessId { get; set; }
        public string BusinessName { get; set; } = default!;
        public Guid? ParentRoleId { get; set; }
        public string? ParentRoleCode { get; set; }
        public string RoleCode { get; set; } = default!;
        public string RoleNameEn { get; set; } = default!;
        public string RoleNameLocal { get; set; } = default!;
        public string? RoleLevel { get; set; }
        public int SortOrder { get; set; }
        public bool IsActive { get; set; }
        public uint RowVersion { get; set; }
    }

    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<SuBusinessRole, Response>()
                .ForMember(destination => destination.ParentRoleCode, options => options.MapFrom(source => source.ParentRole == null ? null : source.ParentRole.RoleCode));
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

            var query = GetAllSuBusinessRoles.BuildQuery(dbContext);
            query = ApplyKeyword(query, keyword);
            query = query.ApplySorting(request.Sorts, x => x.RoleCode);

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

        private static IQueryable<Entities.Su.SuBusinessRole> ApplyKeyword(IQueryable<Entities.Su.SuBusinessRole> query, string? keyword)
        {
            if (string.IsNullOrWhiteSpace(keyword))
            {
                return query;
            }

            var loweredKeyword = keyword.ToLower();
            var hasSortOrder = int.TryParse(keyword, out var parsedSortOrder);
            var hasBool = bool.TryParse(keyword, out var parsedBool);
            var hasActiveKeyword = loweredKeyword is "active" or "inactive";

            return query.Where(x =>
                EF.Functions.ILike(x.RoleCode, $"%{keyword}%") ||
                EF.Functions.ILike(x.RoleNameEn, $"%{keyword}%") ||
                EF.Functions.ILike(x.RoleNameLocal, $"%{keyword}%") ||
                (x.RoleLevel != null && EF.Functions.ILike(x.RoleLevel, $"%{keyword}%")) ||
                (x.ParentRole != null && EF.Functions.ILike(x.ParentRole.RoleCode, $"%{keyword}%")) ||
                (hasSortOrder && x.SortOrder == parsedSortOrder) ||
                (hasBool && x.IsActive == parsedBool) ||
                (hasActiveKeyword && x.IsActive == (loweredKeyword == "active")));
        }
    }
}
