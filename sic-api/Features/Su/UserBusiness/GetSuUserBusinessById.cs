using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using sic_api.Data;
using sic_api.Entities.Su;

namespace sic_api.Features.Su.UserBusiness;

public static class GetSuUserBusinessById
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
            return await dbContext.SuUserBusinesses
                .AsNoTracking()
                .Include(x => x.Business)
                .Where(x => x.Id == request.Id)
                .ProjectTo<Response>(mapper.ConfigurationProvider)
                .FirstOrDefaultAsync(cancellationToken);
        }
    }
}
