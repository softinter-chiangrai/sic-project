using MediatR;
using Microsoft.EntityFrameworkCore;
using sic_api.Data;
using sic_api.Entities.Su;
using sic_api.Extensions;
using sic_api.Services.Interfaces;
using System.Security.Claims;

namespace sic_api.Features.Auth.Profile;

public static class GetProfileActivation
{
    public class Query : IRequest<bool>
    {
        
    }

    public sealed class Handler(SicDbContext dbContext, ICurrentUserService currentUserService) : IRequestHandler<Query, bool>
    {
        public async Task<bool> Handle(Query request, CancellationToken cancellationToken)
        {
            return await dbContext.SuProfiles.Where(x => x.UserId == currentUserService.GetUserId()).AnyAsync(cancellationToken);
        }
    }
}
