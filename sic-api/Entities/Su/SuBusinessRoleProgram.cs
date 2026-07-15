using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace sic_api.Entities.Su;

[Table("su_business_role_program")]
public class SuBusinessRoleProgram : BaseEntity
{
    [Required]
    [ForeignKey(nameof(BusinessRole))]
    [Column("business_role_id")]
    public Guid BusinessRoleId { get; set; }
    public SuBusinessRole BusinessRole { get; set; } = default!;

    [Required]
    [ForeignKey(nameof(Program))]
    [Column("program_id")]
    public Guid ProgramId { get; set; }
    public SuProgram Program { get; set; } = default!;

    [Column("is_active")]
    public bool IsActive { get; set; } = false;

    [Column("role_back")]
    public bool RoleBack { get; set; } = false;

    [Column("role_search")]
    public bool RoleSearch { get; set; } = false;

    [Column("role_add")]
    public bool RoleAdd { get; set; } = false;

    [Column("role_save")]
    public bool RoleSave { get; set; } = false;

    [Column("role_delete")]
    public bool RoleDelete { get; set; } = false;

    [Column("role_print")]
    public bool RolePrint { get; set; } = false;

    
}
