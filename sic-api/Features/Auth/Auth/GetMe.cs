using MediatR;
using sic_api.Extensions;
using System.Security.Claims;

namespace sic_api.Features.Auth.Auth;

public static class GetMe
{
    // Only non-sensitive, user-facing claims are exposed.
    // Internal Keycloak claims (session_state, at_hash, sid, acr, azp, jti, nonce, etc.)
    // are stripped to avoid leaking session metadata.
    private static readonly HashSet<string> SafeClaimTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "sub", "preferred_username", "email", "email_verified",
        "given_name", "family_name", "name",
        "realm_access", "resource_access", "scope",
        ClaimTypes.NameIdentifier, ClaimTypes.Email, ClaimTypes.Name,
        ClaimTypes.GivenName, ClaimTypes.Surname, ClaimTypes.Role
    };

    public class Query : IRequest<Response>
    {
        public ClaimsPrincipal User { get; set; } = default!;
    }

    public class Response
    {
        public string Sub { get; set; } = default!;
        public string? Username { get; set; }
        public object[] Claims { get; set; } = [];
    }

    public sealed class Handler : IRequestHandler<Query, Response>
    {
        public Task<Response> Handle(Query request, CancellationToken cancellationToken)
        {
            return Task.FromResult(new Response
            {
                Sub = request.User.GetUserId(),
                Username = request.User.GetPreferredUsername(),
                Claims = request.User.Claims
                    .Where(x => SafeClaimTypes.Contains(x.Type))
                    .Select(x => (object)new { x.Type, x.Value })
                    .ToArray()
            });
        }
    }
}
