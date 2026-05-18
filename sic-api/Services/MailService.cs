using Microsoft.EntityFrameworkCore;
using sic_api.Data;
using sic_api.Entities.Db;
using sic_api.Services.Interfaces;

namespace sic_api.Services;

public class MailService : IMailService
{
    private readonly SicDbContext _context;
    private readonly ILogger<MailService> _logger;

    public MailService(SicDbContext context, ILogger<MailService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<Guid> AddToQueueAsync(
        string templateCode,
        string recipientEmail,
        string? recipientName = null,
        string? bodyData = null,
        DateTime? scheduledAt = null,
        bool useEnglish = true)
    {
        try
        {
            // Validate template exists
            var template = await _context.Set<DbMailTemplate>()
                .FirstOrDefaultAsync(t => t.TemplateCode == templateCode && t.IsActive);

            if (template == null)
            {
                throw new InvalidOperationException($"Email template '{templateCode}' not found or inactive");
            }

            // Validate config exists
            var config = await _context.Set<DbMailConfig>()
                .FirstOrDefaultAsync(c => c.IsActive);

            if (config == null)
            {
                throw new InvalidOperationException("No active mail configuration found");
            }

            // Create queue entry
            var mailQueue = new DbMailQueue
            {
                Id = Guid.CreateVersion7(),
                TemplateId = template.Id,
                RecipientEmail = recipientEmail,
                RecipientName = recipientName,
                BodyData = bodyData,
                Status = "Pending",
                ScheduledAt = scheduledAt ?? DateTime.UtcNow,
                UseEnglish = useEnglish,
                CreatedBy = "system",
                CreatedDate = DateTime.UtcNow,
                UpdatedBy = "system",
                UpdatedDate = DateTime.UtcNow
            };

            _context.Set<DbMailQueue>().Add(mailQueue);
            await _context.SaveChangesAsync();

            _logger.LogInformation($"Email queued: {recipientEmail} - Template: {templateCode} - Queue ID: {mailQueue.Id}");

            return mailQueue.Id;
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error adding email to queue: {ex.Message}");
            throw;
        }
    }

    public async Task<bool> SendAsync(
        string templateCode,
        string recipientEmail,
        string? recipientName = null,
        string? bodyData = null,
        bool useEnglish = true)
    {
        try
        {
            // Get template
            var template = await _context.Set<DbMailTemplate>()
                .FirstOrDefaultAsync(t => t.TemplateCode == templateCode && t.IsActive);

            if (template == null)
            {
                throw new InvalidOperationException($"Email template '{templateCode}' not found");
            }

            // Get active configs ordered by sort_order
            var configs = await _context.Set<DbMailConfig>()
                .Where(c => c.IsActive)
                .OrderBy(c => c.SortOrder)
                .ToListAsync();

            if (!configs.Any())
            {
                throw new InvalidOperationException("No active mail configuration found");
            }

            // Try each config
            foreach (var config in configs)
            {
                try
                {
                    return await SendEmailAsync(template, config, recipientEmail, recipientName, bodyData, useEnglish);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning($"Failed to send email with config '{config.ConfigName}': {ex.Message}. Trying next config...");
                    continue;
                }
            }

            throw new InvalidOperationException("Failed to send email with all available configurations");
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error sending email: {ex.Message}");
            throw;
        }
    }

    public async Task<(int Pending, int Sending, int Success, int Failed)> GetQueueStatusAsync()
    {
        var queues = _context.Set<DbMailQueue>().AsNoTracking();

        var pending = await queues.CountAsync(q => q.Status == "Pending");
        var sending = await queues.CountAsync(q => q.Status == "Sending");
        var success = await queues.CountAsync(q => q.Status == "Success");
        var failed = await queues.CountAsync(q => q.Status == "Failed");

        return (pending, sending, success, failed);
    }

    private async Task<bool> SendEmailAsync(
        DbMailTemplate template,
        DbMailConfig config,
        string recipientEmail,
        string? recipientName,
        string? bodyData,
        bool isEnglisth)
    {
        try
        {
            // Parse body data and substitute variables
            var subject = isEnglisth ? template.SubjectEn : template.SubjectLocal;
            var body = isEnglisth ? template.ContentEn : template.ContentLocal;

            if (!string.IsNullOrEmpty(bodyData))
            {
                // Simple variable substitution: {variable} -> value
                var variables = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, object>>(bodyData);
                if (variables != null)
                {
                    foreach (var (key, value) in variables)
                    {
                        var stringValue = value?.ToString() ?? string.Empty;
                        subject = subject.Replace($"{{{key}}}", stringValue);
                        body = body.Replace($"{{{key}}}", stringValue);
                    }
                }
            }

            // Send email (implementation would use SmtpClient or similar)
            using (var smtpClient = new System.Net.Mail.SmtpClient(config.SmtpServer, config.SmtpPort))
            {
                smtpClient.EnableSsl = config.EnableSsl;
                smtpClient.Credentials = new System.Net.NetworkCredential(config.Username, config.Password);

                var mailMessage = new System.Net.Mail.MailMessage
                {
                    From = new System.Net.Mail.MailAddress(config.EmailFrom),
                    Subject = subject,
                    Body = body,
                    IsBodyHtml = template.IsHtml
                };

                mailMessage.To.Add(new System.Net.Mail.MailAddress(recipientEmail, recipientName));

                await smtpClient.SendMailAsync(mailMessage);
            }

            _logger.LogInformation($"Email sent successfully to {recipientEmail} using config '{config.ConfigName}'");
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error sending email to {recipientEmail}: {ex.Message}");
            throw;
        }
    }
}
