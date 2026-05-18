using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace sic_api.Entities.Su;

[Table("su_business_audit")]
public class SuBusinessAudit : BaseEntity
{
    [Required]
    [MaxLength(100)]
    [Column("keycloak_user_id")]
    public string KeycloakUserId { get; set; } = default!;

    [MaxLength(100)]
    [Column("username")]
    public string? Username { get; set; }

    [Required]
    [MaxLength(50)]
    [Column("business_id")]
    public Guid BusinessId { get; set; }

    [MaxLength(50)]
    [Column("client_ip")]
    public string? ClientIp { get; set; }

    [MaxLength(500)]
    [Column("remark")]
    public string? Remark { get; set; }
}