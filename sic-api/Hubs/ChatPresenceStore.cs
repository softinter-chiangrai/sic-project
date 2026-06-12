using System.Collections.Concurrent;

namespace sic_api.Hubs;

/// <summary>
/// In-memory store tracking SignalR connection IDs per (userId, businessId) pair.
/// Registered as singleton. Provides online presence and routing for the chat hub.
/// </summary>
public sealed class ChatPresenceStore
{
    // connectionId → (userId, businessId)
    private readonly ConcurrentDictionary<string, (string UserId, Guid BusinessId)> _connectionToUser = new();

    // "userId:businessId" → connection IDs
    private readonly ConcurrentDictionary<string, HashSet<string>> _userConnections = new();
    private readonly Lock _lock = new();

    public void AddConnection(string connectionId, string userId, Guid businessId)
    {
        var key = BuildKey(userId, businessId);
        _connectionToUser[connectionId] = (userId, businessId);
        lock (_lock)
        {
            if (!_userConnections.TryGetValue(key, out var set))
            {
                set = [];
                _userConnections[key] = set;
            }
            set.Add(connectionId);
        }
    }

    public (string? UserId, Guid BusinessId) RemoveConnection(string connectionId)
    {
        if (!_connectionToUser.TryRemove(connectionId, out var info))
            return (null, Guid.Empty);

        var key = BuildKey(info.UserId, info.BusinessId);
        lock (_lock)
        {
            if (_userConnections.TryGetValue(key, out var set))
            {
                set.Remove(connectionId);
                if (set.Count == 0)
                    _userConnections.TryRemove(key, out _);
            }
        }
        return info;
    }

    public bool IsOnline(string userId, Guid businessId)
    {
        var key = BuildKey(userId, businessId);
        return _userConnections.TryGetValue(key, out var set) && set.Count > 0;
    }

    public IReadOnlyList<string> GetConnectionIds(string userId, Guid businessId)
    {
        var key = BuildKey(userId, businessId);
        lock (_lock)
        {
            return _userConnections.TryGetValue(key, out var set)
                ? [.. set]
                : [];
        }
    }

    // ── Active call tracking ──────────────────────────────────────────────────

    private readonly ConcurrentDictionary<string, (Guid LogId, DateTime StartedAt)> _activeCalls = new();

    public void SetActiveCall(string userId1, string userId2, Guid logId, DateTime startedAt)
        => _activeCalls[CallKey(userId1, userId2)] = (logId, startedAt);

    public bool TryGetActiveCall(string userId1, string userId2, out Guid logId, out DateTime startedAt)
    {
        if (_activeCalls.TryGetValue(CallKey(userId1, userId2), out var info))
        {
            logId = info.LogId;
            startedAt = info.StartedAt;
            return true;
        }
        logId = Guid.Empty;
        startedAt = default;
        return false;
    }

    public bool TryRemoveActiveCall(string userId1, string userId2, out Guid logId, out DateTime startedAt)
    {
        if (_activeCalls.TryRemove(CallKey(userId1, userId2), out var info))
        {
            logId = info.LogId;
            startedAt = info.StartedAt;
            return true;
        }
        logId = Guid.Empty;
        startedAt = default;
        return false;
    }

    private static string CallKey(string a, string b)
        => string.Compare(a, b, StringComparison.Ordinal) < 0 ? $"{a}|{b}" : $"{b}|{a}";

    private static string BuildKey(string userId, Guid businessId) => $"{userId}:{businessId}";

    // ── Active group call tracking ────────────────────────────────────────────

    private readonly ConcurrentDictionary<Guid, (Guid LogId, DateTime StartedAt, List<string> Participants)> _activeGroupCalls = new();

    public void SetGroupActiveCall(Guid groupId, Guid logId, DateTime startedAt, string initiatorId)
        => _activeGroupCalls[groupId] = (logId, startedAt, [initiatorId]);

    public void AddGroupCallParticipant(Guid groupId, string userId)
    {
        if (_activeGroupCalls.TryGetValue(groupId, out var info))
        {
            lock (_lock)
            {
                if (!info.Participants.Contains(userId))
                    info.Participants.Add(userId);
            }
        }
    }

    public bool TryRemoveGroupActiveCall(Guid groupId, out Guid logId, out DateTime startedAt, out List<string> participants)
    {
        if (_activeGroupCalls.TryRemove(groupId, out var info))
        {
            logId = info.LogId;
            startedAt = info.StartedAt;
            participants = info.Participants;
            return true;
        }
        logId = Guid.Empty;
        startedAt = default;
        participants = [];
        return false;
    }
}
