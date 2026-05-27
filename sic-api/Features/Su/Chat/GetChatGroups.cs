using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using sic_api.Data;
using System.Security.Claims;
using sic_api.Extensions;

namespace sic_api.Features.Su.Chat;

public static class GetChatGroups
{
    public sealed class Response
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = default!;
        public List<string> MemberUserIds { get; set; } = [];
    }

    public sealed class Query : IRequest<Response[]>
    {
        public ClaimsPrincipal User { get; set; } = default!;
    }

    public sealed class Handler(
        SicDbContext dbContext,
        IHttpContextAccessor httpContextAccessor) : IRequestHandler<Query, Response[]>
    {
        public async Task<Response[]> Handle(Query request, CancellationToken cancellationToken)
        {
            var currentUserId = request.User.GetUserId();

            var businessId = httpContextAccessor.HttpContext?.Items[BusinessContextKeys.ActiveBusinessId] is Guid bId
                ? bId
                : (Guid?)null;

            if (businessId is null)
                return [];

            // Return groups the current user is a member of
            var memberOfGroupIds = await dbContext.SuChatGroupMembers
                .AsNoTracking()
                .Where(m => m.UserId == currentUserId && m.BusinessId == businessId.Value)
                .Select(m => m.GroupId)
                .ToListAsync(cancellationToken);

            if (memberOfGroupIds.Count == 0)
                return [];

            var groups = await dbContext.SuChatGroups
                .AsNoTracking()
                .Where(g => memberOfGroupIds.Contains(g.Id))
                .Select(g => new { g.Id, g.Name })
                .ToListAsync(cancellationToken);

            var memberships = await dbContext.SuChatGroupMembers
                .AsNoTracking()
                .Where(m => memberOfGroupIds.Contains(m.GroupId))
                .Select(m => new { m.GroupId, m.UserId })
                .ToListAsync(cancellationToken);

            var memberMap = memberships
                .GroupBy(m => m.GroupId)
                .ToDictionary(g => g.Key, g => g.Select(m => m.UserId).ToList());

            return groups.Select(g => new Response
            {
                Id = g.Id,
                Name = g.Name,
                MemberUserIds = memberMap.TryGetValue(g.Id, out var members) ? members : [],
            }).ToArray();
        }
    }
}
