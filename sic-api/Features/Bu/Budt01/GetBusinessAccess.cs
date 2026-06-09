using MediatR;
using Microsoft.EntityFrameworkCore;
using sic_api.Data;
using sic_api.Model;
using sic_api.Services.Interfaces;

namespace sic_api.Features.Bu.Budt01;

public static class GetBusinessRole
{
    public class Query : IRequest<Response[]?>
    {
    }

    public class Response : BaseModelState
    {
        public Guid Id { get; set; }
        public string NameEn { get; set; } = default!;
        public string NameLocal { get; set; } = default!;
        public string Code { get; set; } = default!;
        public string Color { get; set; } = default!;
        public List<Response> children { get; set; } = new List<Response>();
    }

    public sealed class Handler( SicDbContext dbContext, IBusinessAccessService businessAccessService)
        : IRequestHandler<Query, Response[]?>
    {
        public async Task<Response[]?> Handle(Query request, CancellationToken cancellationToken)
        {
            var businessId = businessAccessService.GetBusinessId();

            return await dbContext.SuBusinessRoles
                .Where(r => r.BusinessId == businessId)
                .Select(r => new Response
                {
                    Id = r.Id,
                    Code = r.RoleCode,
                    NameEn = r.RoleNameEn,
                    NameLocal = r.RoleNameLocal,
                })
                .ToArrayAsync(cancellationToken);
        }
    }
}
