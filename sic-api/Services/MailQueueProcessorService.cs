using Microsoft.EntityFrameworkCore;
using sic_api.Data;
using sic_api.Entities.Db;

namespace sic_api.Services;

/// <summary>
/// Background service to process mail queue
/// Sends pending emails and retries failed ones
/// </summary>
public class MailQueueProcessorService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<MailQueueProcessorService> _logger;
    private readonly int _processingIntervalSeconds = 60; // Process every minute

    public MailQueueProcessorService(
        IServiceProvider serviceProvider,
        ILogger<MailQueueProcessorService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Mail Queue Processor Service started");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await ProcessMailQueueAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error in Mail Queue Processor: {ex.Message}");
            }

            await Task.Delay(TimeSpan.FromSeconds(_processingIntervalSeconds), stoppingToken);
        }

        _logger.LogInformation("Mail Queue Processor Service stopped");
    }

    private async Task ProcessMailQueueAsync(CancellationToken stoppingToken)
    {
        using (var scope = _serviceProvider.CreateScope())
        {
            var context = scope.ServiceProvider.GetRequiredService<SicDbContext>();

            // Get pending and scheduled emails that should be sent now
            var queueItems = await context.Set<DbMailQueue>()
                .AsTracking()
                .Where(q => q.Status == "Pending" && q.ScheduledAt <= DateTime.UtcNow)
                .OrderBy(q => q.ScheduledAt)
                .Take(10) // Process 10 at a time
                .Include(q => q.MailTemplate)
                .ToListAsync(stoppingToken);

            if (!queueItems.Any())
            {
                return;
            }

            _logger.LogInformation($"Processing {queueItems.Count} emails from queue");

            foreach (var queueItem in queueItems)
            {
                await ProcessMailItemAsync(context, queueItem, stoppingToken);
            }
        }
    }

    private async Task ProcessMailItemAsync(
        SicDbContext context,
        DbMailQueue queueItem,
        CancellationToken stoppingToken)
    {
        try
        {
            // Update status to Sending
            queueItem.Status = "Sending";
            queueItem.UpdatedDate = DateTime.UtcNow;
            await context.SaveChangesAsync(stoppingToken);

            // Get active mail configs ordered by sort_order
            var configs = await context.Set<DbMailConfig>()
                .Where(c => c.IsActive)
                .OrderBy(c => c.SortOrder)
                .ToListAsync(stoppingToken);

            if (!configs.Any())
            {
                throw new InvalidOperationException("No active mail configuration found");
            }

            // Try each config
            bool sent = false;
            foreach (var config in configs)
            {
                try
                {
                    await SendEmailAsync(queueItem, config,queueItem.UseEnglish);
                    
                    // Success
                    queueItem.Status = "Success";
                    queueItem.SentAt = DateTime.UtcNow;
                    queueItem.UsedConfigId = config.Id;
                    queueItem.UpdatedDate = DateTime.UtcNow;
                    queueItem.UpdatedBy = "MailQueueProcessor";
                    
                    _logger.LogInformation($"Email sent successfully to {queueItem.RecipientEmail} (Queue ID: {queueItem.Id})");
                    sent = true;
                    break;
                }
                catch (Exception ex)
                {
                    _logger.LogWarning($"Failed to send email with config '{config.ConfigName}': {ex.Message}");
                    continue;
                }
            }

            if (!sent)
            {
                // All configs failed
                queueItem.RetryCount++;

                if (queueItem.RetryCount >= 3) // Max retries
                {
                    queueItem.Status = "Failed";
                    queueItem.ErrorMessage = "Max retries reached";
                    _logger.LogError($"Email failed after max retries to {queueItem.RecipientEmail} (Queue ID: {queueItem.Id})");
                }
                else
                {
                    // Schedule for retry in 5 minutes
                    queueItem.Status = "Pending";
                    queueItem.NextRetryAt = DateTime.UtcNow.AddMinutes(5);
                    _logger.LogWarning($"Email retry scheduled for {queueItem.RecipientEmail}");
                }
            }

            queueItem.UpdatedDate = DateTime.UtcNow;
            await context.SaveChangesAsync(stoppingToken);
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error processing mail queue item {queueItem.Id}: {ex.Message}");

            queueItem.Status = "Failed";
            queueItem.ErrorMessage = ex.Message;
            queueItem.UpdatedDate = DateTime.UtcNow;

            try
            {
                await context.SaveChangesAsync(stoppingToken);
            }
            catch (Exception saveEx)
            {
                _logger.LogError($"Error updating queue item status: {saveEx.Message}");
            }
        }
    }

    private async Task SendEmailAsync(DbMailQueue queueItem, DbMailConfig config,bool useEnglish)
    {
        try
        {
            var template = queueItem.MailTemplate;

            // Parse and substitute variables
            var subject = useEnglish ? template.SubjectEn : template.SubjectLocal;
            var body = useEnglish ? template.ContentEn : template.ContentLocal;

            if (!string.IsNullOrEmpty(queueItem.BodyData))
            {
                try
                {
                    var variables = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, object>>(queueItem.BodyData);
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
                catch (Exception ex)
                {
                    _logger.LogWarning($"Error parsing body data: {ex.Message}");
                }
            }

            // Send email via SMTP
            using (var smtpClient = new System.Net.Mail.SmtpClient(config.SmtpServer, config.SmtpPort))
            {
                smtpClient.EnableSsl = config.EnableSsl;
                smtpClient.Credentials = new System.Net.NetworkCredential(config.Username, config.Password);
                smtpClient.Timeout = 10000; // 10 seconds timeout

                var mailMessage = new System.Net.Mail.MailMessage
                {
                    From = new System.Net.Mail.MailAddress(config.EmailFrom),
                    Subject = subject,
                    Body = body,
                    IsBodyHtml = template.IsHtml
                };

                mailMessage.To.Add(new System.Net.Mail.MailAddress(queueItem.RecipientEmail, queueItem.RecipientName ?? ""));

                await smtpClient.SendMailAsync(mailMessage);
            }
        }
        catch (Exception ex)
        {
            throw new InvalidOperationException($"Failed to send email to {queueItem.RecipientEmail}: {ex.Message}", ex);
        }
    }
}
