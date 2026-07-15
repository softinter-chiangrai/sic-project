using MediatR;
using Microsoft.EntityFrameworkCore;
using sic_api.Data;
using sic_api.Services.Interfaces;

namespace sic_api.Features.Marketplace.Mprt02;

public static class GetMprt02Marketplaces
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

        public bool Installed { get; set; }

        public string InstallStatus { get; set; } = "NOT_INSTALLED";

        public int EntityCount { get; set; }

        public int ProgramCount { get; set; }

        public DateTime? InstalledDate { get; set; }
    }

    public sealed class Handler(
        SicDbContext dbContext,
        IBusinessAccessService businessAccessService)
        : IRequestHandler<Query, List<Response>>
    {
        public async Task<List<Response>> Handle(
            Query request,
            CancellationToken cancellationToken)
        {
            var businessId = businessAccessService.GetBusinessId();

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

            var marketplaces = await query
                .OrderBy(x => x.AppCode)
                .Select(x => new
                {
                    x.Id,
                    x.AppCode,
                    x.AppName,
                    EntityCount = x.Entities.Count(e => !e.IsDelete),
                    ProgramCount = x.Programs.Count(p => !p.IsDelete)
                })
                .ToListAsync(cancellationToken);

            var marketplaceIds = marketplaces.Select(x => x.Id).ToList();

            var installedItems = await dbContext.MpBusinessMarketplaces
                .AsNoTracking()
                .Where(x =>
                    x.BusinessId == businessId &&
                    marketplaceIds.Contains(x.MarketplaceId) &&
                    !x.IsDelete)
                .ToListAsync(cancellationToken);

            var installedMap = installedItems.ToDictionary(x => x.MarketplaceId);

            return marketplaces.Select(x =>
            {
                installedMap.TryGetValue(x.Id, out var installed);

                return new Response
                {
                    Id = x.Id,
                    AppCode = x.AppCode,
                    AppName = x.AppName,
                    EntityCount = x.EntityCount,
                    ProgramCount = x.ProgramCount,
                    Installed = installed is not null,
                    InstallStatus = installed?.InstallStatus ?? "NOT_INSTALLED",
                    InstalledDate = installed?.InstalledDate
                };
            }).ToList();
        }
    }
}