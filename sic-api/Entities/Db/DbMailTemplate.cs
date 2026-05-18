using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace sic_api.Entities.Db;

[Index(nameof(TemplateCode), IsUnique = true)]
[Table("db_mail_template")]
public class DbMailTemplate : BaseEntity
{
    [Required]
    [MaxLength(50)]
    [Column("template_code")]
    public string TemplateCode { get; set; } = default!;

    [Required]
    [MaxLength(255)]
    [Column("template_name")]
    public string TemplateName { get; set; } = default!;

    [Required]
    [MaxLength(255)]
    [Column("subject_en")]
    public string SubjectEn { get; set; } = default!;

    [Required]
    [MaxLength(255)]
    [Column("subject_local")]
    public string SubjectLocal { get; set; } = default!;

    [Required]
    [Column("content_en")]
    public string ContentEn { get; set; } = default!;

    [Required]
    [Column("content_local")]
    public string ContentLocal { get; set; } = default!;

    [Column("is_html")]
    public bool IsHtml { get; set; } = false;

    [Column("is_active")]
    public bool IsActive { get; set; } = false;

    [MaxLength(3000)]
    [Column("variables")]
    public string? Variables { get; set; }

    public ICollection<DbMailQueue>? MailQueues { get; set; }
}
