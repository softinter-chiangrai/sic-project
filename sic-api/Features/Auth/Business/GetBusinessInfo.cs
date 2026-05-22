using MediatR;
using sic_api.Attributes;
using sic_api.Model.Business;
using sic_api.Model.Storage;
using sic_api.Services.Interfaces;

namespace sic_api.Features.Auth.Business;

public static class GetBusinessInfo
{
    public class Query : IRequest<BusinessDto?>
    {
        
    }

    public sealed class Handler(IBusinessAccessService businessAccessService)
        : IRequestHandler<Query, BusinessDto?>
    {
        public async Task<BusinessDto?> Handle(Query request, CancellationToken cancellationToken)
        {
            Guid id = businessAccessService.GetBusinessId();
            BusinessDto? business = await businessAccessService.GetBusinessAsync(id, cancellationToken);
            return business;
        }
    }
}
