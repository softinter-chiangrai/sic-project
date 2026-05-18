using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace sic_api.Entities.Su;

[Index(nameof(UserBusinessId), nameof(BusinessRoleId), IsUnique = true)]
[Table("su_user_business_role")]
public class SuUserBusinessRole : BaseEntity
{
    [Required]
    [ForeignKey(nameof(UserBusiness))]
    [Column("user_business_id")]
    public Guid UserBusinessId { get; set; }
    public SuUserBusiness UserBusiness { get; set; } = default!;

    [Required]
    [ForeignKey(nameof(BusinessRole))]
    [Column("business_role_id")]
    public Guid BusinessRoleId { get; set; }
    public SuBusinessRole BusinessRole { get; set; } = default!;

    [Column("is_primary")]
    public bool IsPrimary { get; set; } = false;

    [Column("is_active")]
    public bool IsActive { get; set; } = false;

}
