using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using sic_api.Data;
using sic_api.Entities.Su;

namespace sic_api.Features.Su.UserBusiness;

public static class GetAllSuUserCompanies
{
    public sealed class Response
    {
        public Guid Id { get; set; }
        public string UserId { get; set; } = default!;
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

    public class Query : IRequest<IReadOnlyList<Response>>
    {
    }

    public sealed class Handler(SicDbContext dbContext, IMapper mapper) : IRequestHandler<Query, IReadOnlyList<Response>>
    {
        public async Task<IReadOnlyList<Response>> Handle(Query request, CancellationToken cancellationToken)
        {
            return await dbContext.SuUserBusinesses
                .AsNoTracking()
                .Include(x => x.Business)
                .OrderBy(x => x.UserId)
                .ThenBy(x => x.Business.Id)
                .ProjectTo<Response>(mapper.ConfigurationProvider)
                .ToListAsync(cancellationToken);
        }
    }
}
