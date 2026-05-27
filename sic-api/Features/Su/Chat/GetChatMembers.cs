using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using sic_api.Data;
using sic_api.Hubs;
using System.Security.Claims;
using sic_api.Extensions;
using sic_api.Attributes;
using sic_api.Model.Storage;

namespace sic_api.Features.Su.Chat;

public static class GetChatMembers
{
    public sealed class Response
    {
        public string UserId { get; set; } = default!;
        public string DisplayName { get; set; } = default!;
        public bool IsOnline { get; set; }

        [Storage("UploadGroupData")]
        public Guid? UploadGroupId { get; set; } = null;

        public List<StorageUploadReference> UploadGroupData { get; set; } = [];
    }

    public sealed class Query : IRequest<Response[]>
    {
        public ClaimsPrincipal User { get; set; } = default!;
    }

    public sealed class Handler(
        SicDbContext dbContext,
        IHttpContextAccessor httpContextAccessor,
        ChatPresenceStore presenceStore) : IRequestHandler<Query, Response[]>
    {
        public async Task<Response[]> Handle(Query request, CancellationToken cancellationToken)
        {
            var currentUserId = request.User.GetUserId();

            var businessId = httpContextAccessor.HttpContext?.Items[BusinessContextKeys.ActiveBusinessId] is Guid bId
                ? bId
                : (Guid?)null;

            if (businessId is null)
                return [];

            var members = await dbContext.SuUserBusinesses
                .AsNoTracking()
                .Where(x => x.BusinessId == businessId.Value && x.IsActive && x.UserId != currentUserId)
                .Select(x => x.UserId)
                .ToListAsync(cancellationToken);

            if (members.Count == 0)
                return [];

            var profiles = await dbContext.SuProfiles
                .AsNoTracking()
                .Where(p => members.Contains(p.UserId))
                .Select(p => new { p.UserId, p.FirstNameLocal, p.FirstNameEn, p.LastNameLocal, p.LastNameEn, p.UploadGroupId })
                .ToListAsync(cancellationToken);

            var profileMap = profiles.ToDictionary(p => p.UserId);

            return members.Select(userId =>
            {
                profileMap.TryGetValue(userId, out var profile);
                var first = profile?.FirstNameLocal ?? profile?.FirstNameEn ?? string.Empty;
                var last = profile?.LastNameLocal ?? profile?.LastNameEn ?? string.Empty;
                var displayName = $"{first} {last}".Trim();
                if (string.IsNullOrWhiteSpace(displayName)) displayName = userId;

                return new Response
                {
                    UserId = userId,
                    DisplayName = displayName,
                    IsOnline = presenceStore.IsOnline(userId, businessId.Value),
                    UploadGroupId = profile?.UploadGroupId
                };
            }).ToArray();
        }
    }
}
