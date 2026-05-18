using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace sic_api.Entities.Db;

[Table("db_mail_queue")]
public class DbMailQueue : BaseEntity
{
    [Required]
    [ForeignKey(nameof(MailTemplate))]
    [Column("template_id")]
    public Guid TemplateId { get; set; }
    public DbMailTemplate MailTemplate { get; set; } = default!;

    [Required]
    [MaxLength(255)]
    [Column("recipient_email")]
    public string RecipientEmail { get; set; } = default!;

    [MaxLength(255)]
    [Column("recipient_name")]
    public string? RecipientName { get; set; }

    [Column("body_data")]
    public string? BodyData { get; set; }

    [Required]
    [MaxLength(20)]
    [Column("status")]
    public string Status { get; set; } = "Pending";

    [Column("retry_count")]
    public int RetryCount { get; set; } = 0;

    [MaxLength(500)]
    [Column("error_message")]
    public string? ErrorMessage { get; set; }

    [Column("scheduled_at")]
    public DateTime? ScheduledAt { get; set; }

    [Column("sent_at")]
    public DateTime? SentAt { get; set; }

    [Column("next_retry_at")]
    public DateTime? NextRetryAt { get; set; }

    [Column("used_config_id")]
    public Guid? UsedConfigId { get; set; }

    [Column("use_english")]
    public bool UseEnglish { get; set; } = false;
}
