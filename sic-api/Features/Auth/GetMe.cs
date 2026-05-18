using MediatR;
using sic_api.Extensions;
using System.Security.Claims;

namespace sic_api.Features.Auth;

public static class GetMe
{
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
                Sub = request.User.GetKeycloakUserId(),
                Username = request.User.GetPreferredUsername(),
                Claims = request.User.Claims
                    .Select(x => (object)new { x.Type, x.Value })
                    .ToArray()
            });
        }
    }
}
