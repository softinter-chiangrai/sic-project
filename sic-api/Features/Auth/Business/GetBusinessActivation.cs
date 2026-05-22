using MediatR;
using sic_api.Model.Business;
using sic_api.Services.Interfaces;

namespace sic_api.Features.Auth.Business;

public static class GetBusinessActivation
{
    public class Query : IRequest<bool> { }

    public sealed class Handler(IBusinessAccessService businessAccessService)
        : IRequestHandler<Query, bool>
    {
        public Task<bool> Handle(Query request, CancellationToken cancellationToken)
            => businessAccessService.GetBusinessActivationAsync(cancellationToken);
    }
}
