using MediatR;
using Microsoft.EntityFrameworkCore;
using sic_api.Data;
using sic_api.Model;
using sic_api.Services.Interfaces;

namespace sic_api.Features.Su.UserBusinessRole;

public static class GetSuUserBusinessRoleLov
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

            return await GetAllSuUserBusinessRoles.BuildQuery(dbContext)
                .OrderBy(x => x.UserBusiness.KeycloakUserId)
                .ThenBy(x => x.BusinessRole.RoleCode)
                .Select(x => new LovBase
                {
                    Value = x.Id,
                    Text = x.UserBusiness.KeycloakUserId + " - " + x.BusinessRole.RoleCode + " - " + (useEnglish ? x.BusinessRole.RoleNameEn : x.BusinessRole.RoleNameLocal)
                })
                .ToArrayAsync(cancellationToken);
        }
    }
}
