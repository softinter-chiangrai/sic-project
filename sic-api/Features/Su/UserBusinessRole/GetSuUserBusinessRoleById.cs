using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using sic_api.Data;
using sic_api.Entities.Su;

namespace sic_api.Features.Su.UserBusinessRole;

public static class GetSuUserBusinessRoleById
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
                .ForMember(destination => destination.Id, options => options.MapFrom(source => source.UserBusiness.Business.Id))
                .ForMember(destination => destination.RoleCode, options => options.MapFrom(source => source.BusinessRole.RoleCode))
                .ForMember(destination => destination.RoleNameEn, options => options.MapFrom(source => source.BusinessRole.RoleNameEn))
                .ForMember(destination => destination.RoleNameLocal, options => options.MapFrom(source => source.BusinessRole.RoleNameLocal));
        }
    }

    public class Query : IRequest<Response?>
    {
        public Guid Id { get; set; }
    }

    public sealed class Handler(SicDbContext dbContext, IMapper mapper) : IRequestHandler<Query, Response?>
    {
        public async Task<Response?> Handle(Query request, CancellationToken cancellationToken)
        {
            return await GetAllSuUserBusinessRoles.BuildQuery(dbContext)
                .Where(x => x.Id == request.Id)
                .ProjectTo<Response>(mapper.ConfigurationProvider)
                .FirstOrDefaultAsync(cancellationToken);
        }
    }
}
