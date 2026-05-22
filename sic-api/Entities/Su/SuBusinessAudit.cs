using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace sic_api.Entities.Su;

[Table("su_business_audit")]
public class SuBusinessAudit : BaseEntity
{
    [Required]
    [MaxLength(100)]
    [Column("user_id")]
    public string UserId { get; set; } = default!;

    [MaxLength(100)]
    [Column("session_id")]
    public string SessionId { get; set; } = default!;

    [MaxLength(100)]
    [Column("username")]
    public string? Username { get; set; }

    [Required]
    [ForeignKey(nameof(Business))]
    [Column("business_id")]
    public Guid BusinessId { get; set; }
    public SuBusiness Business { get; set; } = default!;

    [MaxLength(50)]
    [Column("client_ip")]
    public string? ClientIp { get; set; }

    [Required]
    [Column("is_active")]
    public bool IsActive { get; set; } = false;

    [MaxLength(500)]
    [Column("remark")]
    public string? Remark { get; set; }
}