using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace sic_api.Entities.Su;

[Index(nameof(BusinessRoleId), nameof(ProgramId), IsUnique = true)]
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

    [Column("is_back")]
    public bool IsBack { get; set; } = false;

    [Column("is_search")]
    public bool IsSearch { get; set; } = false;

    [Column("is_add")]
    public bool IsAdd { get; set; } = false;

    [Column("is_save")]
    public bool IsSave { get; set; } = false;

    [Column("is_remove")]
    public bool IsRemove { get; set; } = false;

    [Column("is_print")]
    public bool IsPrint { get; set; } = false;

    
}
