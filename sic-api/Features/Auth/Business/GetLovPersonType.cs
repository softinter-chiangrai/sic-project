using MediatR;
using Microsoft.EntityFrameworkCore;
using sic_api.Data;
using sic_api.Entities.Db;
using sic_api.Extensions;
using sic_api.Model;
using sic_api.Services.Interfaces;

namespace sic_api.Features.Auth.Business;

public static class  GetLovPersonType
{
    public class Query : IRequest<List<LovBase>>
    {
        
    }

    public sealed class Handler(
        SicDbContext dbContext,
        IRequestLanguageProvider requestLanguageProvider) : IRequestHandler<Query, List<LovBase>>
    {
        public async Task<List<LovBase>> Handle(Query request, CancellationToken cancellationToken)
        {
            var useEnglish = requestLanguageProvider.UseEnglish();

            return await dbContext.DbParameters
                .AsNoTracking()
                .Where(x => x.ModuleCode == "DB" && x.ParameterCode == "PERSON_TYPE" && x.IsActive)
                .OrderBy(x => x.SortOrder)
                .Select(x => new LovBase
                {
                    Value = x.ParameterValue,
                    Text = useEnglish ? x.ParameterNameEn : x.ParameterNameLocal
                })
                .ToListAsync(cancellationToken);
        }
    }
}
