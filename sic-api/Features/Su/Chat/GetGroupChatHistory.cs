using MediatR;
using Microsoft.EntityFrameworkCore;
using sic_api.Data;
using sic_api.Entities.Su;
using System.Security.Claims;
using sic_api.Extensions;

namespace sic_api.Features.Su.Chat;

public static class GetGroupChatHistory
{
    public sealed class Response
    {
        public Guid Id { get; set; }
        public Guid GroupId { get; set; }
        public string SenderId { get; set; } = default!;
        public string Message { get; set; } = string.Empty;
        public ChatMessageType MessageType { get; set; }
        public Guid? AttachmentId { get; set; }
        public string? AttachmentUrl { get; set; }
        public string? AttachmentFileName { get; set; }
        public long? AttachmentFileSize { get; set; }
        public string? AttachmentContentType { get; set; }
        public bool IsCancelled { get; set; }
        public DateTime SentAt { get; set; }
    }

    public sealed class Query : IRequest<Response[]>
    {
        public ClaimsPrincipal User { get; set; } = default!;
        public Guid GroupId { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 50;
    }

    public sealed class Handler(SicDbContext dbContext) : IRequestHandler<Query, Response[]>
    {
        public async Task<Response[]> Handle(Query request, CancellationToken cancellationToken)
        {
            var currentUserId = request.User.GetUserId();
            var page = Math.Max(1, request.Page);
            var pageSize = Math.Clamp(request.PageSize, 1, 100);

            // Verify caller is a group member
            var isMember = await dbContext.SuChatGroupMembers
                .AsNoTracking()
                .AnyAsync(m => m.GroupId == request.GroupId && m.UserId == currentUserId, cancellationToken);

            if (!isMember)
                return [];

            return await dbContext.SuChatGroupLogs
                .AsNoTracking()
                .Include(x => x.Attachment)
                .Where(x => x.GroupId == request.GroupId)
                .OrderByDescending(x => x.CreatedDate)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(x => new Response
                {
                    Id = x.Id,
                    GroupId = x.GroupId,
                    SenderId = x.SenderId,
                    Message = x.Message,
                    MessageType = x.MessageType,
                    AttachmentId = x.AttachmentId,
                    AttachmentUrl = x.Attachment != null ? x.Attachment.AccessUrl : null,
                    AttachmentFileName = x.Attachment != null ? x.Attachment.FileName : null,
                    AttachmentFileSize = x.Attachment != null ? (long?)x.Attachment.FileSize : null,
                    AttachmentContentType = x.Attachment != null ? x.Attachment.ContentType : null,
                    IsCancelled = x.IsCancelled,
                    SentAt = x.CreatedDate,
                })
                .ToArrayAsync(cancellationToken);
        }
    }
}
