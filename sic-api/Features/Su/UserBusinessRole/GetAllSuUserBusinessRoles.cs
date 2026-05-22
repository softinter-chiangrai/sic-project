using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using sic_api.Data;
using sic_api.Entities.Su;

namespace sic_api.Features.Su.UserBusinessRole;

public static class GetAllSuUserBusinessRoles
{
    public sealed class Response
    {
        public Guid Id { get; set; }
        public Guid UserBusinessId { get; set; }
        public string UserId { get; set; } = default!;
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
                .ForMember(destination => destination.UserId, options => options.MapFrom(source => source.UserBusiness.UserId))
                .ForMember(destination => destination.BusinessId, options => options.MapFrom(source => source.UserBusiness.BusinessId))
                .ForMember(destination => destination.RoleCode, options => options.MapFrom(source => source.BusinessRole.RoleCode))
                .ForMember(destination => destination.RoleNameEn, options => options.MapFrom(source => source.BusinessRole.RoleNameEn))
                .ForMember(destination => destination.RoleNameLocal, options => options.MapFrom(source => source.BusinessRole.RoleNameLocal));
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
                .OrderBy(x => x.UserBusiness.UserId)
                .ThenBy(x => x.BusinessRole.RoleCode)
                .ProjectTo<Response>(mapper.ConfigurationProvider)
                .ToListAsync(cancellationToken);
        }
    }

    internal static IQueryable<Entities.Su.SuUserBusinessRole> BuildQuery(SicDbContext dbContext)
    {
        return dbContext.SuUserBusinessRoles
            .AsNoTracking()
            .Include(x => x.UserBusiness)
                .ThenInclude(x => x.Business)
            .Include(x => x.BusinessRole)
            .AsQueryable();
    }
}
