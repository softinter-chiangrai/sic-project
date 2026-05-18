using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace sic_api.Entities.Su;

[Table("su_business_invite")]
public class SuBusinessInvite : BaseEntity
{
    [Required]
    [ForeignKey(nameof(SuBusinessRole))]
    [Column("role_id")]
    public Guid RoleId { get; set; }
    public SuBusinessRole SuBusinessRole { get; set; } = default!;

    [Required]
    [Column("invite_type")]
    public string InviteType { get; set; } = default!;

    [MaxLength(320)]
    [Column("invite_email")]
    public string? InviteEmail { get; set; }

    [MaxLength(300)]
    [Column("invite_token")]
    public string? InviteToken { get; set; }

    [Column("is_activated")]
    public bool IsActivated { get; set; } = false;

}
