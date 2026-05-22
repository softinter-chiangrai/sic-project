using MediatR;
using sic_api.Services.Interfaces;

namespace sic_api.Features.Auth.Business;

public static class GetBusinessAccess
{
    public class Query : IRequest<Response>
    {
    }

    public class Response
    {
        public Guid BusinessId { get; set; }
        public bool CanAccess { get; set; }
    }

    public sealed class Handler(IBusinessAccessService businessAccessService)
        : IRequestHandler<Query, Response>
    {
        public async Task<Response> Handle(Query request, CancellationToken cancellationToken)
        {
            var businessId = businessAccessService.GetBusinessId();
            var canAccess = await businessAccessService.CanAccessBusinessAsync(businessId, cancellationToken);

            return new Response
            {
                BusinessId = businessId,
                CanAccess = canAccess
            };
        }
    }
}
