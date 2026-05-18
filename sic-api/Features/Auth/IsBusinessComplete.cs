using MediatR;
using Microsoft.EntityFrameworkCore;
using sic_api.Data;
using sic_api.Entities.Su;
using sic_api.Extensions;
using sic_api.Services.Interfaces;
using System.Security.Claims;

namespace sic_api.Features.Auth;

public static class IsBusinessComplete
{
    public class Query : IRequest<bool>
    {
        public ClaimsPrincipal User { get; set; } = default!;
    }

    public sealed class Handler(SicDbContext dbContext) : IRequestHandler<Query, bool>
    {
        public async Task<bool> Handle(Query request, CancellationToken cancellationToken)
        {
            return await dbContext.SuUserBusinesses.Where(x => x.KeycloakUserId == request.User.GetKeycloakUserId()).AnyAsync(cancellationToken);
        }
    }
}
