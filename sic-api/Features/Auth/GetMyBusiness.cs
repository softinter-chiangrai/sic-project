using MediatR;
using sic_api.Model.Business;
using sic_api.Services.Interfaces;

namespace sic_api.Features.Auth;

public static class GetMyCompanies
{
    public class Query : IRequest<List<BusinessDto>>
    {
    }

    public sealed class Handler(IBusinessAccessService businessAccessService)
        : IRequestHandler<Query, List<BusinessDto>>
    {
        public async Task<List<BusinessDto>> Handle(Query request, CancellationToken cancellationToken)
        {
            return await businessAccessService.GetMyBusinessesAsync(cancellationToken);
        }
    }
}
