using MediatR;
using Microsoft.EntityFrameworkCore;
using sic_api.Data;
using sic_api.Entities.Ex;

namespace sic_api.Features.Ex.Example;

public static class GetAllExExamples
{
    public class Query : IRequest<IReadOnlyList<ExExample>>
    {
    }

    public sealed class Handler(SicDbContext dbContext) : IRequestHandler<Query, IReadOnlyList<ExExample>>
    {
        public async Task<IReadOnlyList<ExExample>> Handle(Query request, CancellationToken cancellationToken)
        {
            return await dbContext.ExExamples
                .AsNoTracking()
                .OrderBy(x => x.ExampleCode)
                .ToListAsync(cancellationToken);
        }
    }
}
