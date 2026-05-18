using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using sic_api.Data;
using sic_api.Entities.Su;

namespace sic_api.Features.Su.BusinessRoleProgram;

public static class GetSuBusinessRoleProgramById
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
                .ForMember(destination => destination.Id, options => options.MapFrom(source => source.BusinessRole.Business.Id))
                .ForMember(destination => destination.RoleCode, options => options.MapFrom(source => source.BusinessRole.RoleCode))
                .ForMember(destination => destination.RoleNameEn, options => options.MapFrom(source => source.BusinessRole.RoleNameEn))
                .ForMember(destination => destination.RoleNameLocal, options => options.MapFrom(source => source.BusinessRole.RoleNameLocal))
                .ForMember(destination => destination.ProgramCode, options => options.MapFrom(source => source.Program.ProgramCode))
                .ForMember(destination => destination.ProgramNameEn, options => options.MapFrom(source => source.Program.NameEn))
                .ForMember(destination => destination.ProgramNameLocal, options => options.MapFrom(source => source.Program.NameLocal));
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
            return await GetAllSuBusinessRolePrograms.BuildQuery(dbContext)
                .Where(x => x.Id == request.Id)
                .ProjectTo<Response>(mapper.ConfigurationProvider)
                .FirstOrDefaultAsync(cancellationToken);
        }
    }
}
