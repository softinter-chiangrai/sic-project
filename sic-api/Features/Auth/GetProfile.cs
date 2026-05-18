using MediatR;
using Microsoft.EntityFrameworkCore;
using sic_api.Data;
using sic_api.Entities.Su;
using sic_api.Extensions;
using sic_api.Services.Interfaces;
using System.Security.Claims;

namespace sic_api.Features.Auth;

public static class GetProfile
{
    public class Query : IRequest<Response?>
    {
        public ClaimsPrincipal User { get; set; } = default!;
    }

    public class Response
    {
        public string Sub { get; set; } = default!;
        public string Name { get; set; } = default!;
    }

    public sealed class Handler(SicDbContext dbContext,
        IRequestLanguageProvider requestLanguageProvider) : IRequestHandler<Query, Response?>
    {
        public async Task<Response?> Handle(Query request, CancellationToken cancellationToken)
        {
            var sub = request.User.GetKeycloakUserId();

            var profile = await dbContext.SuProfiles
                .Include(x => x.Title)
                .Where(x => x.KeycloakUserId == sub)
                .AsNoTracking()
                .FirstOrDefaultAsync(cancellationToken);

            if (profile == null)
            {
                return null;
            }

            return new Response
            {
                Sub = profile.KeycloakUserId,
                Name = GetLocalizedName(profile)
            };
        }

        public string GetLocalizedName(SuProfile profile)
        {
            var title = profile.Title;
            if (title == null)
            {
                return string.Empty;
            }
            return requestLanguageProvider.UseEnglish()
                ? $"{title.PrefixNameEn}{title.SuffixNameEn} {profile.FirstNameEn} {profile.LastNameEn} {title.SuffixNameEn}".Trim()
                : $"{title.PrefixNameLocal}{title.SuffixNameLocal} {profile.FirstNameLocal} {profile.LastNameLocal} {title.SuffixNameLocal}".Trim();
        }
        
    }
}
