using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace sic_api.Entities.Su;

[Index(nameof(BusinessId), nameof(RoleCode), IsUnique = true)]
[Table("su_business_role")]
public class SuBusinessRole : BaseEntity
{
    [Required]
    [ForeignKey(nameof(Business))]
    [Column("business_id")]
    public Guid BusinessId { get; set; }
    public SuBusiness Business { get; set; } = default!;

    [ForeignKey(nameof(ParentRole))]
    [Column("parent_role_id")]
    public Guid? ParentRoleId { get; set; }
    public SuBusinessRole? ParentRole { get; set; }

    [Required]
    [MaxLength(50)]
    [Column("role_code")]
    public string RoleCode { get; set; } = default!;

    [Required]
    [MaxLength(255)]
    [Column("role_name_en")]
    public string RoleNameEn { get; set; } = default!;

    [Required]
    [MaxLength(255)]
    [Column("role_name_local")]
    public string RoleNameLocal { get; set; } = default!;

    [MaxLength(50)]
    [Column("role_level")]
    public string? RoleLevel { get; set; }

    [Column("sort_order")]
    public int? SortOrder { get; set; }

    [Column("is_active")]
    public bool IsActive { get; set; } = true;

    public ICollection<SuBusinessRole> ChildRoles { get; set; } = new List<SuBusinessRole>();
    public ICollection<SuBusinessRoleProgram> RolePrograms { get; set; } = new List<SuBusinessRoleProgram>();
    public ICollection<SuUserBusinessRole> UserBusinessRoles { get; set; } = new List<SuUserBusinessRole>();
    public ICollection<SuBusinessInvite> Invites { get; set; } = new List<SuBusinessInvite>();
}
