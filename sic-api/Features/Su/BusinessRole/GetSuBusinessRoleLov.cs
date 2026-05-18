using MediatR;
using Microsoft.EntityFrameworkCore;
using sic_api.Data;
using sic_api.Model;
using sic_api.Services.Interfaces;

namespace sic_api.Features.Su.BusinessRole;

public static class GetSuBusinessRoleLov
{
    public class Query : IRequest<LovBase[]>
    {
    }

    public sealed class Handler(
        SicDbContext dbContext,
        IRequestLanguageProvider requestLanguageProvider) : IRequestHandler<Query, LovBase[]>
    {
        public async Task<LovBase[]> Handle(Query request, CancellationToken cancellationToken)
        {
            var useEnglish = requestLanguageProvider.UseEnglish();

            return await GetAllSuBusinessRoles.BuildQuery(dbContext)
                .OrderBy(x => x.Business.Id)
                .ThenBy(x => x.SortOrder)
                .ThenBy(x => x.RoleCode)
                .Select(x => new LovBase
                {
                    Value = x.Id,
                    Text = x.Business.Id + " - " + x.RoleCode + " - " + (useEnglish ? x.RoleNameEn : x.RoleNameLocal)
                })
                .ToArrayAsync(cancellationToken);
        }
    }
}
