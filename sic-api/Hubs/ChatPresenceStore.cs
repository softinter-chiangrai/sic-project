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

    private static string BuildKey(string userId, Guid businessId) => $"{userId}:{businessId}";
}
