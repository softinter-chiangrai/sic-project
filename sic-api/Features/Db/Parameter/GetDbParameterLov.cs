using MediatR;
using Microsoft.EntityFrameworkCore;
using sic_api.Data;
using sic_api.Model;
using sic_api.Services.Interfaces;

namespace sic_api.Features.Db.Parameter;

public static class GetDbParameterLov
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

            return await  dbContext.DbParameters
                .OrderBy(x => x.SortOrder)
                .ThenBy(x => x.ParameterValue)
                .Select(x => new LovBase
                {
                    Value = x.Id,
                    Text = useEnglish ? x.ParameterNameEn : x.ParameterNameLocal
                })
                .ToArrayAsync(cancellationToken);
        }
    }
}
