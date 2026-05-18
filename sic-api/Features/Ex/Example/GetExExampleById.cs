using MediatR;
using Microsoft.EntityFrameworkCore;
using sic_api.Data;
using sic_api.Entities.Ex;

namespace sic_api.Features.Ex.Example;

public static class GetExExampleById
{
    public class Query : IRequest<ExExample?>
    {
        public Guid Id { get; set; }
    }

    public sealed class Handler(SicDbContext dbContext) : IRequestHandler<Query, ExExample?>
    {
        public async Task<ExExample?> Handle(Query request, CancellationToken cancellationToken)
        {
            return await dbContext.ExExamples
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);
        }
    }
}
