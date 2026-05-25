using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using sic_api.Data;
using sic_api.Entities.Su;
using sic_api.Extensions;

namespace sic_api.Hubs;

[Authorize]
public sealed class ChatHub(SicDbContext db, ChatPresenceStore presence) : Hub
{
    private string CurrentUserId =>
        Context.User?.GetUserId() ?? throw new HubException("Unauthenticated.");

    private Guid CurrentBusinessId()
    {
        var val = Context.GetHttpContext()?.Items[BusinessContextKeys.ActiveBusinessId];
        if (val is Guid g && g != Guid.Empty) return g;
        throw new HubException("No active business context.");
    }

    // ──────────────────────────────────────────────
    // Connection lifecycle
    // ──────────────────────────────────────────────

    public override async Task OnConnectedAsync()
    {
        var businessId = CurrentBusinessId();
        var userId = CurrentUserId;

        presence.AddConnection(Context.ConnectionId, userId, businessId);
        await Groups.AddToGroupAsync(Context.ConnectionId, BizGroup(businessId));

        // Notify peers in same business
        await Clients.OthersInGroup(BizGroup(businessId))
            .SendAsync("UserStatusChanged", userId, true);

        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var (userId, businessId) = presence.RemoveConnection(Context.ConnectionId);

        if (userId is not null && !presence.IsOnline(userId, businessId))
        {
            await Clients.OthersInGroup(BizGroup(businessId))
                .SendAsync("UserStatusChanged", userId, false);
        }

        await base.OnDisconnectedAsync(exception);
    }

    // ──────────────────────────────────────────────
    // Messaging
    // ──────────────────────────────────────────────

    public async Task SendMessage(
        string receiverUserId,
        string message,
        ChatMessageType messageType,
        Guid? attachmentId)
    {
        if (string.IsNullOrWhiteSpace(message) && attachmentId is null) return;

        var senderId = CurrentUserId;
        var businessId = CurrentBusinessId();

        // Ensure receiver belongs to the same business
        var receiverInBusiness = await db.SuUserBusinesses
            .AnyAsync(x => x.UserId == receiverUserId && x.BusinessId == businessId && x.IsActive);
        if (!receiverInBusiness) return;

        var log = new SuChatLog
        {
            SenderId = senderId,
            ReceiverId = receiverUserId,
            Message = message,
            MessageType = messageType,
            AttachmentId = attachmentId,
        };

        db.SuChatLogs.Add(log);
        await db.SaveChangesAsync();

        string? attachmentUrl = null;
        if (attachmentId.HasValue)
        {
            attachmentUrl = await db.SuUploads
                .Where(u => u.Id == attachmentId.Value)
                .Select(u => u.AccessUrl)
                .FirstOrDefaultAsync();
        }

        var payload = new ChatMessageDto
        {
            Id = log.Id,
            SenderId = senderId,
            ReceiverId = receiverUserId,
            Message = log.Message,
            MessageType = log.MessageType,
            AttachmentId = log.AttachmentId,
            AttachmentUrl = attachmentUrl,
            SentAt = log.CreatedDate,
        };

        // Push to receiver (all connections in same business)
        foreach (var connId in presence.GetConnectionIds(receiverUserId, businessId))
            await Clients.Client(connId).SendAsync("ReceiveMessage", payload);

        // Echo to sender
        await Clients.Caller.SendAsync("ReceiveMessage", payload);
    }

    public async Task CancelMessage(Guid messageId)
    {
        var userId = CurrentUserId;
        var businessId = CurrentBusinessId();

        var log = await db.SuChatLogs
            .FirstOrDefaultAsync(x => x.Id == messageId && x.SenderId == userId);
        if (log is null) return;

        if ((DateTime.UtcNow - log.CreatedDate).TotalMinutes > 2) return;

        log.IsCancelled = true;
        log.CancelledAt = DateTime.UtcNow;
        log.CancelledBy = userId;
        await db.SaveChangesAsync();

        // Notify both parties
        foreach (var connId in presence.GetConnectionIds(log.ReceiverId, businessId))
            await Clients.Client(connId).SendAsync("MessageCancelled", messageId);

        await Clients.Caller.SendAsync("MessageCancelled", messageId);
    }

    // ──────────────────────────────────────────────
    // WebRTC signalling – audio & video calls
    // ──────────────────────────────────────────────

    public async Task StartCall(string receiverUserId, string callType, string sdpOffer)
    {
        var senderId = CurrentUserId;
        var businessId = CurrentBusinessId();

        if (!presence.IsOnline(receiverUserId, businessId)) return;

        var receiverInBusiness = await db.SuUserBusinesses
            .AnyAsync(x => x.UserId == receiverUserId && x.BusinessId == businessId && x.IsActive);
        if (!receiverInBusiness) return;

        var callerProfile = await db.SuProfiles
            .AsNoTracking()
            .Where(p => p.UserId == senderId)
            .Select(p => new { p.FirstNameLocal, p.FirstNameEn })
            .FirstOrDefaultAsync();

        var callerName = callerProfile?.FirstNameLocal
            ?? callerProfile?.FirstNameEn
            ?? senderId;

        foreach (var connId in presence.GetConnectionIds(receiverUserId, businessId))
            await Clients.Client(connId).SendAsync("IncomingCall", senderId, callerName, callType, sdpOffer);
    }

    public async Task AnswerCall(string callerUserId, string sdpAnswer, bool accepted)
    {
        var businessId = CurrentBusinessId();
        foreach (var connId in presence.GetConnectionIds(callerUserId, businessId))
            await Clients.Client(connId).SendAsync("CallAnswered", sdpAnswer, accepted);
    }

    public async Task SendIceCandidate(string peerUserId, string candidate)
    {
        var businessId = CurrentBusinessId();
        foreach (var connId in presence.GetConnectionIds(peerUserId, businessId))
            await Clients.Client(connId).SendAsync("IceCandidate", candidate);
    }

    public async Task EndCall(string peerUserId)
    {
        var businessId = CurrentBusinessId();
        foreach (var connId in presence.GetConnectionIds(peerUserId, businessId))
            await Clients.Client(connId).SendAsync("CallEnded");
    }

    // ──────────────────────────────────────────────
    // Helpers
    // ──────────────────────────────────────────────

    private static string BizGroup(Guid businessId) => $"biz:{businessId}";
}

public sealed class ChatMessageDto
{
    public Guid Id { get; set; }
    public string SenderId { get; set; } = default!;
    public string ReceiverId { get; set; } = default!;
    public string Message { get; set; } = string.Empty;
    public ChatMessageType MessageType { get; set; }
    public Guid? AttachmentId { get; set; }
    public string? AttachmentUrl { get; set; }
    public DateTime SentAt { get; set; }
    public bool IsCancelled { get; set; }
}
