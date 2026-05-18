using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using sic_api.Data;
using sic_api.Entities.Su;
using sic_api.Extensions;
using sic_api.Model;

namespace sic_api.Features.Su.BusinessRoleProgram;

public static class GetSuBusinessRoleProgramPage
{
    public sealed class Response
    {
        public Guid Id { get; set; }
        public Guid BusinessRoleId { get; set; }
        public Guid BusinessId { get; set; }
        public string RoleCode { get; set; } = default!;
        public string RoleNameEn { get; set; } = default!;
        public string RoleNameLocal { get; set; } = default!;
        public Guid ProgramId { get; set; }
        public string ProgramCode { get; set; } = default!;
        public string ProgramNameEn { get; set; } = default!;
        public string ProgramNameLocal { get; set; } = default!;
        public bool IsActive { get; set; }
        public uint RowVersion { get; set; }
    }

    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<SuBusinessRoleProgram, Response>()
                .ForMember(destination => destination.BusinessId, options => options.MapFrom(source => source.BusinessRole.BusinessId))
                .ForMember(destination => destination.RoleCode, options => options.MapFrom(source => source.BusinessRole.RoleCode))
                .ForMember(destination => destination.RoleNameEn, options => options.MapFrom(source => source.BusinessRole.RoleNameEn))
                .ForMember(destination => destination.RoleNameLocal, options => options.MapFrom(source => source.BusinessRole.RoleNameLocal))
                .ForMember(destination => destination.ProgramCode, options => options.MapFrom(source => source.Program.ProgramCode))
                .ForMember(destination => destination.ProgramNameEn, options => options.MapFrom(source => source.Program.NameEn))
                .ForMember(destination => destination.ProgramNameLocal, options => options.MapFrom(source => source.Program.NameLocal));
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

            var query = GetAllSuBusinessRolePrograms.BuildQuery(dbContext);
            query = ApplyKeyword(query, keyword);
            query = query.ApplySorting(request.Sorts, x => x.BusinessRole.RoleCode);

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

        private static IQueryable<Entities.Su.SuBusinessRoleProgram> ApplyKeyword(IQueryable<Entities.Su.SuBusinessRoleProgram> query, string? keyword)
        {
            if (string.IsNullOrWhiteSpace(keyword))
            {
                return query;
            }

            var loweredKeyword = keyword.ToLower();
            var hasBool = bool.TryParse(keyword, out var parsedBool);
            var hasActiveKeyword = loweredKeyword is "active" or "inactive";

            return query.Where(x =>
                EF.Functions.ILike(x.BusinessRole.RoleCode, $"%{keyword}%") ||
                EF.Functions.ILike(x.BusinessRole.RoleNameEn, $"%{keyword}%") ||
                EF.Functions.ILike(x.BusinessRole.RoleNameLocal, $"%{keyword}%") ||
                EF.Functions.ILike(x.Program.ProgramCode, $"%{keyword}%") ||
                EF.Functions.ILike(x.Program.NameEn, $"%{keyword}%") ||
                EF.Functions.ILike(x.Program.NameLocal, $"%{keyword}%") ||
                (hasBool && x.IsActive == parsedBool) ||
                (hasActiveKeyword && x.IsActive == (loweredKeyword == "active")));
        }
    }
}
