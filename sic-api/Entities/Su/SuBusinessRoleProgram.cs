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

    
}
