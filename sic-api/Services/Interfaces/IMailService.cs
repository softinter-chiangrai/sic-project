namespace sic_api.Services.Interfaces;

public interface IMailService
{
    /// <summary>
    /// Add email to queue for sending
    /// </summary>
    /// <param name="templateCode">Email template code</param>
    /// <param name="recipientEmail">Recipient email address</param>
    /// <param name="recipientName">Recipient name (optional)</param>
    /// <param name="bodyData">JSON data for template variables</param>
    /// <param name="scheduledAt">When to send (optional, default: ASAP)</param>
    /// <returns>Queue ID</returns>
    Task<Guid> AddToQueueAsync(
        string templateCode,
        string recipientEmail,
        string? recipientName = null,
        string? bodyData = null,
        DateTime? scheduledAt = null,
        bool useEnglish = true);

    /// <summary>
    /// Send email immediately (not queued)
    /// </summary>
    Task<bool> SendAsync(
        string templateCode,
        string recipientEmail,
        string? recipientName = null,
        string? bodyData = null,
        bool useEnglish = true);

    /// <summary>
    /// Get queue status
    /// </summary>
    Task<(int Pending, int Sending, int Success, int Failed)> GetQueueStatusAsync();
}
