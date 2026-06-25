using MediatR;
using Microsoft.EntityFrameworkCore;
using sic_api.Data;

namespace sic_api.Features.Marketplace.Mprt01;

public static class GetMprt01Marketplaces
{
    public class Query : IRequest<List<Response>>
    {
        public string? Keyword { get; set; }
    }

    public class Response
    {
        public Guid Id { get; set; }

        public string AppCode { get; set; } = default!;

        public string AppName { get; set; } = default!;

        public int EntityCount { get; set; }

        public int ProgramCount { get; set; }

        public int InstallCount { get; set; }

        public bool CanDelete { get; set; }

        public DateTime UpdatedDate { get; set; }
    }

    public sealed class Handler(SicDbContext dbContext)
        : IRequestHandler<Query, List<Response>>
    {
        public async Task<List<Response>> Handle(
            Query request,
            CancellationToken cancellationToken)
        {
            var query = dbContext.MpMarketplaces
                .AsNoTracking()
                .Where(x => !x.IsDelete);

            if (!string.IsNullOrWhiteSpace(request.Keyword))
            {
                var keyword = request.Keyword.Trim().ToLower();

                query = query.Where(x =>
                    x.AppCode.ToLower().Contains(keyword) ||
                    x.AppName.ToLower().Contains(keyword));
            }

            var data = await query
                .OrderBy(x => x.AppCode)
                .Select(x => new Response
                {
                    Id = x.Id,
                    AppCode = x.AppCode,
                    AppName = x.AppName,
                    EntityCount = x.Entities.Count(e => !e.IsDelete),
                    ProgramCount = x.Programs.Count(p => !p.IsDelete),
                    InstallCount = dbContext.MpBusinessMarketplaces.Count(b =>
                        b.MarketplaceId == x.Id &&
                        !b.IsDelete),
                    UpdatedDate = x.UpdatedDate
                })
                .ToListAsync(cancellationToken);

            foreach (var item in data)
            {
                item.CanDelete = item.InstallCount == 0;
            }

            return data;
        }
    }
}