using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using sic_api.Data;
using sic_api.Entities.Su;

namespace sic_api.Features.Su.BusinessRole;

public static class GetAllSuBusinessRoles
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

    public class Query : IRequest<IReadOnlyList<Response>>
    {
    }

    public sealed class Handler(SicDbContext dbContext, IMapper mapper) : IRequestHandler<Query, IReadOnlyList<Response>>
    {
        public async Task<IReadOnlyList<Response>> Handle(Query request, CancellationToken cancellationToken)
        {
            return await BuildQuery(dbContext)
                .OrderBy(x => x.Business.Id)
                .ThenBy(x => x.SortOrder)
                .ThenBy(x => x.RoleCode)
                .ProjectTo<Response>(mapper.ConfigurationProvider)
                .ToListAsync(cancellationToken);
        }
    }

    internal static IQueryable<Entities.Su.SuBusinessRole> BuildQuery(SicDbContext dbContext)
    {
        return dbContext.SuBusinessRoles
            .AsNoTracking()
            .Include(x => x.Business)
            .Include(x => x.ParentRole)
            .AsQueryable();
    }
}
