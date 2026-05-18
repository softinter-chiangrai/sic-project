using MediatR;
using Microsoft.EntityFrameworkCore;
using sic_api.Data;
using sic_api.Model;
using sic_api.Services.Interfaces;

namespace sic_api.Features.Su.TaskMaster;

public static class GetSuTaskLov
{
    public class Query : IRequest<LovBase[]>
    {
        public bool? IsActive { get; set; }
        public string? Keyword { get; set; }
    }

    public sealed class Handler(
        SicDbContext dbContext,
        IRequestLanguageProvider requestLanguageProvider) : IRequestHandler<Query, LovBase[]>
    {
        public async Task<LovBase[]> Handle(Query request, CancellationToken cancellationToken)
        {
            var useEnglish = requestLanguageProvider.UseEnglish();
            var keyword = request.Keyword?.Trim();

            var query = dbContext.SuTasks.AsNoTracking().AsQueryable();

            if (request.IsActive.HasValue)
            {
                query = query.Where(x => x.IsActive == request.IsActive.Value);
            }

            if (!string.IsNullOrWhiteSpace(keyword))
            {
                query = query.Where(x =>
                    EF.Functions.ILike(x.TaskCode!, $"%{keyword}%") ||
                    (x.TaskNameEn != null && EF.Functions.ILike(x.TaskNameEn, $"%{keyword}%")) ||
                    (x.TaskNameLocal != null && EF.Functions.ILike(x.TaskNameLocal, $"%{keyword}%")));
            }

            return await query
                .OrderBy(x => x.TaskCode)
                .Select(x => new LovBase
                {
                    Value = x.Id,
                    Text = x.TaskCode + " - " + (useEnglish ? x.TaskNameEn : x.TaskNameLocal)
                })
                .ToArrayAsync(cancellationToken);
        }
    }
}
