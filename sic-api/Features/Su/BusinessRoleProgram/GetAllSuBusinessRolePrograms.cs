using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using sic_api.Data;
using sic_api.Entities.Su;

namespace sic_api.Features.Su.BusinessRoleProgram;

public static class GetAllSuBusinessRolePrograms
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

    public class Query : IRequest<IReadOnlyList<Response>>
    {
    }

    public sealed class Handler(SicDbContext dbContext, IMapper mapper) : IRequestHandler<Query, IReadOnlyList<Response>>
    {
        public async Task<IReadOnlyList<Response>> Handle(Query request, CancellationToken cancellationToken)
        {
            return await BuildQuery(dbContext)
                .OrderBy(x => x.BusinessRole.Business.Id)
                .ThenBy(x => x.BusinessRole.RoleCode)
                .ThenBy(x => x.Program.ProgramCode)
                .ProjectTo<Response>(mapper.ConfigurationProvider)
                .ToListAsync(cancellationToken);
        }
    }

    internal static IQueryable<Entities.Su.SuBusinessRoleProgram> BuildQuery(SicDbContext dbContext)
    {
        return dbContext.SuBusinessRolePrograms
            .AsNoTracking()
            .Include(x => x.BusinessRole)
                .ThenInclude(x => x.Business)
            .Include(x => x.Program)
            .AsQueryable();
    }
}
