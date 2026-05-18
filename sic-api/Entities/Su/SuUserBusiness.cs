using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace sic_api.Entities.Su;

[Index(nameof(KeycloakUserId), nameof(BusinessId), IsUnique = true)]
[Table("su_user_business")]
public class SuUserBusiness : BaseEntity
{
    [Required]
    [MaxLength(100)]
    [Column("keycloak_user_id")]
    public string KeycloakUserId { get; set; } = default!;

    [Required]
    [ForeignKey(nameof(Business))]
    [Column("business_id")]
    public Guid BusinessId { get; set; }
    public SuBusiness Business { get; set; } = default!;

    [Required]
    [Column("is_default")]
    public bool IsDefault { get; set; } = false;

    [Required]
    [Column("is_active")]
    public bool IsActive { get; set; } = false;
    
    public ICollection<SuUserBusinessRole>? UserBusinessRoles { get; set; }
}
