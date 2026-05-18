using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using sic_api.Data;
using sic_api.Entities.Su;

namespace sic_api.Features.Su.Program;

public static class GetAllSuPrograms
{
    public sealed class Response
    {
        public Guid Id { get; set; }
        public Guid? ParentProgramId { get; set; }
        public string? ParentProgramCode { get; set; }
        public string ProgramCode { get; set; } = default!;
        public string? Icon { get; set; }
        public string NameEn { get; set; } = default!;
        public string NameLocal { get; set; } = default!;
        public string? RoutePath { get; set; }
        public int SortOrder { get; set; }
        public bool IsActive { get; set; }
        public uint RowVersion { get; set; }
    }

    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<SuProgram, Response>()
                .ForMember(destination => destination.ParentProgramCode, options => options.MapFrom(source => source.ParentProgram == null ? null : source.ParentProgram.ProgramCode));
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
                .OrderBy(x => x.SortOrder)
                .ThenBy(x => x.ProgramCode)
                .ProjectTo<Response>(mapper.ConfigurationProvider)
                .ToListAsync(cancellationToken);
        }
    }

    internal static IQueryable<Entities.Su.SuProgram> BuildQuery(SicDbContext dbContext)
    {
        return dbContext.SuPrograms
            .AsNoTracking()
            .Include(x => x.ParentProgram)
            .AsQueryable();
    }
}
