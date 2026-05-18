using MediatR;
using Microsoft.EntityFrameworkCore;
using sic_api.Data;

namespace sic_api.Features.Su.UserTask;

public static class SearchSuUserTasks
{
    public sealed class Response
    {
        public Guid Id { get; set; }
        public Guid TaskId { get; set; }
        public string? TaskCode { get; set; }
        public string? TaskNameEn { get; set; }
        public string? TaskNameLocal { get; set; }
        public string? Title { get; set; }
        public DateTime? StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public string? Description { get; set; }
        public uint RowVersion { get; set; }
    }

    public class Query : IRequest<Response[]>
    {
        public Guid? TaskId { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string? Keyword { get; set; }
    }

    public sealed class Handler(SicDbContext dbContext) : IRequestHandler<Query, Response[]>
    {
        public async Task<Response[]> Handle(Query request, CancellationToken cancellationToken)
        {
            var keyword = request.Keyword?.Trim();

            var query = dbContext.SuUserTasks
                .AsNoTracking()
                .Include(x => x.Task)
                .AsQueryable();

            if (request.TaskId.HasValue)
            {
                query = query.Where(x => x.TaskId == request.TaskId.Value);
            }

            if (request.StartDate.HasValue)
            {
                var startDate = request.StartDate.Value;
                query = query.Where(x => (x.EndTime ?? x.StartTime) >= startDate);
            }

            if (request.EndDate.HasValue)
            {
                var endDate = request.EndDate.Value;
                query = query.Where(x => (x.StartTime ?? x.EndTime) <= endDate);
            }

            if (!string.IsNullOrWhiteSpace(keyword))
            {
                query = query.Where(x =>
                    (x.Title != null && EF.Functions.ILike(x.Title, $"%{keyword}%")) ||
                    (x.Description != null && EF.Functions.ILike(x.Description, $"%{keyword}%")) ||
                    EF.Functions.ILike(x.Task.TaskCode!, $"%{keyword}%") ||
                    (x.Task.TaskNameEn != null && EF.Functions.ILike(x.Task.TaskNameEn, $"%{keyword}%")) ||
                    (x.Task.TaskNameLocal != null && EF.Functions.ILike(x.Task.TaskNameLocal, $"%{keyword}%")));
            }

            return await query
                .OrderBy(x => x.StartTime)
                .ThenBy(x => x.Title)
                .Select(x => new Response
                {
                    Id = x.Id,
                    TaskId = x.TaskId,
                    TaskCode = x.Task.TaskCode,
                    TaskNameEn = x.Task.TaskNameEn,
                    TaskNameLocal = x.Task.TaskNameLocal,
                    Title = x.Title,
                    StartTime = x.StartTime,
                    EndTime = x.EndTime,
                    Description = x.Description,
                    RowVersion = x.RowVersion
                })
                .ToArrayAsync(cancellationToken);
        }
    }
}
