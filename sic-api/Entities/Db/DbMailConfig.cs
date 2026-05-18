using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace sic_api.Entities.Db;

[Table("db_mail_config")]
public class DbMailConfig : BaseEntity
{
    [Required]
    [MaxLength(100)]
    [Column("config_name")]
    public string ConfigName { get; set; } = default!;

    [Required]
    [MaxLength(255)]
    [Column("smtp_server")]
    public string SmtpServer { get; set; } = default!;

    [Required]
    [Column("smtp_port")]
    public int SmtpPort { get; set; }

    [Required]
    [MaxLength(320)]
    [Column("email_from")]
    public string EmailFrom { get; set; } = default!;

    [Required]
    [MaxLength(100)]
    [Column("username")]
    public string Username { get; set; } = default!;

    [Required]
    [MaxLength(500)]
    [Column("password")]
    public string Password { get; set; } = default!;

    [Column("enable_ssl")]
    public bool EnableSsl { get; set; } = false;

    [Column("sort_order")]
    public int SortOrder { get; set; } = 1;

    [Column("is_active")]
    public bool IsActive { get; set; } = false;

    [Column("max_retry")]
    public int MaxRetry { get; set; } = 3;

    [MaxLength(500)]
    [Column("description")]
    public string? Description { get; set; }

    public ICollection<DbMailQueue>? MailQueues { get; set; }
}
