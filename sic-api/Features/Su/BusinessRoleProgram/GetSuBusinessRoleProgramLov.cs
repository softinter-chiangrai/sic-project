using MediatR;
using Microsoft.EntityFrameworkCore;
using sic_api.Data;
using sic_api.Model;
using sic_api.Services.Interfaces;

namespace sic_api.Features.Su.BusinessRoleProgram;

public static class GetSuBusinessRoleProgramLov
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

            return await GetAllSuBusinessRolePrograms.BuildQuery(dbContext)
                .OrderBy(x => x.BusinessRole.Business.Id)
                .ThenBy(x => x.BusinessRole.RoleCode)
                .ThenBy(x => x.Program.ProgramCode)
                .Select(x => new LovBase
                {
                    Value = x.Id,
                    Text = x.BusinessRole.RoleCode + " -> " + x.Program.ProgramCode + " - " + (useEnglish ? x.Program.NameEn : x.Program.NameLocal)
                })
                .ToArrayAsync(cancellationToken);
        }
    }
}
