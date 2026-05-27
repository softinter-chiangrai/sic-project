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
        string? attachmentFileName = null;
        long? attachmentFileSize = null;
        string? attachmentContentType = null;
        if (attachmentId.HasValue)
        {
            var upload = await db.SuUploads
                .Where(u => u.Id == attachmentId.Value)
                .Select(u => new { u.AccessUrl, u.FileName, u.FileSize, u.ContentType })
                .FirstOrDefaultAsync();
            attachmentUrl = upload?.AccessUrl;
            attachmentFileName = upload?.FileName;
            attachmentFileSize = upload?.FileSize;
            attachmentContentType = upload?.ContentType;
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
            AttachmentFileName = attachmentFileName,
            AttachmentFileSize = attachmentFileSize,
            AttachmentContentType = attachmentContentType,
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
        if (log.MessageType == ChatMessageType.Call) return;
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

        // Persist call log entry
        var log = new SuChatLog
        {
            SenderId = senderId,
            ReceiverId = receiverUserId,
            Message = callType,
            MessageType = ChatMessageType.Call,
        };
        db.SuChatLogs.Add(log);
        await db.SaveChangesAsync();

        presence.SetActiveCall(senderId, receiverUserId, log.Id, DateTime.UtcNow);

        var callDto = new ChatMessageDto
        {
            Id = log.Id,
            SenderId = senderId,
            ReceiverId = receiverUserId,
            Message = callType,
            MessageType = ChatMessageType.Call,
            SentAt = log.CreatedDate,
        };

        // Notify both parties so the chat window shows the call entry
        foreach (var connId in presence.GetConnectionIds(receiverUserId, businessId))
            await Clients.Client(connId).SendAsync("ReceiveMessage", callDto);
        await Clients.Caller.SendAsync("ReceiveMessage", callDto);

        // Send the actual incoming-call signal to the receiver
        foreach (var connId in presence.GetConnectionIds(receiverUserId, businessId))
            await Clients.Client(connId).SendAsync("IncomingCall", senderId, callerName, callType, sdpOffer);
    }

    public async Task AnswerCall(string callerUserId, string sdpAnswer, bool accepted)
    {
        var answererId = CurrentUserId;
        var businessId = CurrentBusinessId();

        // Update call log and notify both parties
        if (presence.TryGetActiveCall(callerUserId, answererId, out var logId, out var startedAt))
        {
            var log = await db.SuChatLogs.FindAsync(logId);
            if (log is not null)
            {
                log.CallAccepted = accepted;
                if (!accepted)
                {
                    log.CallDurationSeconds = 0;
                    presence.TryRemoveActiveCall(callerUserId, answererId, out _, out _);
                }
                else
                {
                    // Reset timer so duration = actual connected time
                    presence.SetActiveCall(callerUserId, answererId, logId, DateTime.UtcNow);
                }
                await db.SaveChangesAsync();

                var updatedDto = new ChatMessageDto
                {
                    Id = log.Id,
                    SenderId = log.SenderId,
                    ReceiverId = log.ReceiverId,
                    Message = log.Message,
                    MessageType = ChatMessageType.Call,
                    SentAt = log.CreatedDate,
                    CallAccepted = log.CallAccepted,
                    CallDurationSeconds = log.CallDurationSeconds,
                };

                foreach (var connId in presence.GetConnectionIds(callerUserId, businessId))
                    await Clients.Client(connId).SendAsync("CallLogUpdated", updatedDto);
                await Clients.Caller.SendAsync("CallLogUpdated", updatedDto);
            }
        }

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
        var userId = CurrentUserId;
        var businessId = CurrentBusinessId();

        // Finalize call log with duration
        if (presence.TryRemoveActiveCall(userId, peerUserId, out var logId, out var startedAt))
        {
            var log = await db.SuChatLogs.FindAsync(logId);
            if (log is not null)
            {
                log.CallDurationSeconds = (int)(DateTime.UtcNow - startedAt).TotalSeconds;
                if (log.CallAccepted is null) log.CallAccepted = false; // hung up before answer
                await db.SaveChangesAsync();

                var updatedDto = new ChatMessageDto
                {
                    Id = log.Id,
                    SenderId = log.SenderId,
                    ReceiverId = log.ReceiverId,
                    Message = log.Message,
                    MessageType = ChatMessageType.Call,
                    SentAt = log.CreatedDate,
                    CallAccepted = log.CallAccepted,
                    CallDurationSeconds = log.CallDurationSeconds,
                };

                foreach (var connId in presence.GetConnectionIds(peerUserId, businessId))
                    await Clients.Client(connId).SendAsync("CallLogUpdated", updatedDto);
                await Clients.Caller.SendAsync("CallLogUpdated", updatedDto);
            }
        }

        foreach (var connId in presence.GetConnectionIds(peerUserId, businessId))
            await Clients.Client(connId).SendAsync("CallEnded");
    }

    // ──────────────────────────────────────────────
    // Recording notification
    // ──────────────────────────────────────────────

    /// <summary>
    /// Notify the call peer that this client started or stopped recording.
    /// No DB persistence — purely a real-time signal.
    /// </summary>
    public async Task NotifyRecording(string peerUserId, bool isStarting)
    {
        var senderId = CurrentUserId;
        var businessId = CurrentBusinessId();

        foreach (var connId in presence.GetConnectionIds(peerUserId, businessId))
            await Clients.Client(connId).SendAsync("RecordingNotification", senderId, isStarting);
    }

    // ──────────────────────────────────────────────
    // Group chat
    // ──────────────────────────────────────────────

    /// <summary>Create a new group chat with the given members.</summary>
    public async Task CreateGroup(string name, List<string> memberUserIds)
    {
        var creatorId = CurrentUserId;
        var businessId = CurrentBusinessId();

        if (string.IsNullOrWhiteSpace(name)) throw new HubException("Group name is required.");
        if (memberUserIds.Count < 1) throw new HubException("At least one other member is required.");

        // Verify all members belong to the same business
        var validMembers = await db.SuUserBusinesses
            .Where(x => memberUserIds.Contains(x.UserId) && x.BusinessId == businessId && x.IsActive)
            .Select(x => x.UserId)
            .ToListAsync();

        var group = new SuChatGroup
        {
            Name = name.Trim(),
            BusinessId = businessId,
            CreatedBy = creatorId,
            UpdatedBy = creatorId,
        };
        db.SuChatGroups.Add(group);

        // Add creator + valid members
        var allMembers = validMembers.Contains(creatorId)
            ? validMembers
            : [creatorId, .. validMembers];

        foreach (var userId in allMembers.Distinct())
        {
            db.SuChatGroupMembers.Add(new SuChatGroupMember
            {
                GroupId = group.Id,
                UserId = userId,
                BusinessId = businessId,
                CreatedBy = creatorId,
                UpdatedBy = creatorId,
            });
        }

        await db.SaveChangesAsync();

        // Notify all group members (including creator) via "GroupCreated"
        var groupDto = new ChatGroupDto
        {
            Id = group.Id,
            Name = group.Name,
            MemberUserIds = [.. allMembers.Distinct()],
        };

        foreach (var memberId in allMembers.Distinct())
        {
            foreach (var connId in presence.GetConnectionIds(memberId, businessId))
                await Clients.Client(connId).SendAsync("GroupCreated", groupDto);
        }

        // Also tell the creator (in case not online in above loop)
        await Clients.Caller.SendAsync("GroupCreated", groupDto);
    }

    /// <summary>Send a message to a group chat.</summary>
    public async Task SendGroupMessage(
        Guid groupId,
        string message,
        ChatMessageType messageType,
        Guid? attachmentId)
    {
        if (string.IsNullOrWhiteSpace(message) && attachmentId is null) return;

        var senderId = CurrentUserId;
        var businessId = CurrentBusinessId();

        // Verify sender is a member
        var isMember = await db.SuChatGroupMembers
            .AnyAsync(x => x.GroupId == groupId && x.UserId == senderId);
        if (!isMember) return;

        var log = new SuChatGroupLog
        {
            GroupId = groupId,
            SenderId = senderId,
            Message = message,
            MessageType = messageType,
            AttachmentId = attachmentId,
            BusinessId = businessId,
            CreatedBy = senderId,
            UpdatedBy = senderId,
        };
        db.SuChatGroupLogs.Add(log);
        await db.SaveChangesAsync();

        string? attachmentUrl = null;
        string? attachmentFileName = null;
        long? attachmentFileSize = null;
        string? attachmentContentType = null;
        if (attachmentId.HasValue)
        {
            var upload = await db.SuUploads
                .Where(u => u.Id == attachmentId.Value)
                .Select(u => new { u.AccessUrl, u.FileName, u.FileSize, u.ContentType })
                .FirstOrDefaultAsync();
            attachmentUrl = upload?.AccessUrl;
            attachmentFileName = upload?.FileName;
            attachmentFileSize = upload?.FileSize;
            attachmentContentType = upload?.ContentType;
        }

        var payload = new ChatGroupMessageDto
        {
            Id = log.Id,
            GroupId = groupId,
            SenderId = senderId,
            Message = log.Message,
            MessageType = log.MessageType,
            AttachmentId = log.AttachmentId,
            AttachmentUrl = attachmentUrl,
            AttachmentFileName = attachmentFileName,
            AttachmentFileSize = attachmentFileSize,
            AttachmentContentType = attachmentContentType,
            SentAt = log.CreatedDate,
        };

        // Deliver to all online group members
        var memberIds = await db.SuChatGroupMembers
            .Where(x => x.GroupId == groupId)
            .Select(x => x.UserId)
            .ToListAsync();

        foreach (var memberId in memberIds)
        {
            foreach (var connId in presence.GetConnectionIds(memberId, businessId))
                await Clients.Client(connId).SendAsync("ReceiveGroupMessage", payload);
        }
    }

    /// <summary>Cancel a group message (within 2-minute window).</summary>
    public async Task CancelGroupMessage(Guid messageId)
    {
        var userId = CurrentUserId;
        var businessId = CurrentBusinessId();

        var log = await db.SuChatGroupLogs
            .FirstOrDefaultAsync(x => x.Id == messageId && x.SenderId == userId);
        if (log is null) return;
        if ((DateTime.UtcNow - log.CreatedDate).TotalMinutes > 2) return;

        log.IsCancelled = true;
        log.CancelledAt = DateTime.UtcNow;
        log.CancelledBy = userId;
        await db.SaveChangesAsync();

        var memberIds = await db.SuChatGroupMembers
            .Where(x => x.GroupId == log.GroupId)
            .Select(x => x.UserId)
            .ToListAsync();

        foreach (var memberId in memberIds)
        {
            foreach (var connId in presence.GetConnectionIds(memberId, businessId))
                await Clients.Client(connId).SendAsync("GroupMessageCancelled", messageId);
        }
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
    public string? AttachmentFileName { get; set; }
    public long? AttachmentFileSize { get; set; }
    public string? AttachmentContentType { get; set; }
    public bool? CallAccepted { get; set; }
    public int? CallDurationSeconds { get; set; }
    public DateTime SentAt { get; set; }
    public bool IsCancelled { get; set; }
}

public sealed class ChatGroupDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public List<string> MemberUserIds { get; set; } = [];
}

public sealed class ChatGroupMessageDto
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
    public DateTime SentAt { get; set; }
    public bool IsCancelled { get; set; }
}
