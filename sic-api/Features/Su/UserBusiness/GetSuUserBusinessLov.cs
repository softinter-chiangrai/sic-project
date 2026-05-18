using MediatR;
using Microsoft.EntityFrameworkCore;
using sic_api.Data;
using sic_api.Model;

namespace sic_api.Features.Su.UserBusiness;

public static class GetSuUserBusinessLov
{
    public class Query : IRequest<LovBase[]>
    {
    }

    public sealed class Handler(SicDbContext dbContext) : IRequestHandler<Query, LovBase[]>
    {
        public async Task<LovBase[]> Handle(Query request, CancellationToken cancellationToken)
        {
            return await dbContext.SuUserBusinesses
                .AsNoTracking()
                .Include(x => x.Business)
                .OrderBy(x => x.KeycloakUserId)
                .ThenBy(x => x.Business.Id)
                .Select(x => new LovBase
                {
                    Value = x.Id,
                    Text = x.KeycloakUserId + " - " + x.Business.Id
                })
                .ToArrayAsync(cancellationToken);
        }
    }
}
