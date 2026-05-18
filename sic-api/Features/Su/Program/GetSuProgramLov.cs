using MediatR;
using Microsoft.EntityFrameworkCore;
using sic_api.Data;
using sic_api.Model;
using sic_api.Services.Interfaces;

namespace sic_api.Features.Su.Program;

public static class GetSuProgramLov
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

            return await GetAllSuPrograms.BuildQuery(dbContext)
                .OrderBy(x => x.SortOrder)
                .ThenBy(x => x.ProgramCode)
                .Select(x => new LovBase
                {
                    Value = x.Id,
                    Text = x.ProgramCode + " - " + (useEnglish ? x.NameEn : x.NameLocal)
                })
                .ToArrayAsync(cancellationToken);
        }
    }
}
