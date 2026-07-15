using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace sic_api.Entities.Su;

[Table("su_program")]
public class SuProgram : BaseEntity
{
    [ForeignKey(nameof(ParentProgram))]
    [Column("parent_program_id")]
    public Guid? ParentProgramId { get; set; }
    public SuProgram? ParentProgram { get; set; }

    [Required]
    [MaxLength(50)]
    [Column("program_code")]
    public string ProgramCode { get; set; } = default!;

    [MaxLength(100)]
    [Column("icon")]
    public string? Icon { get; set; }

    [Required]
    [MaxLength(255)]
    [Column("name_en")]
    public string NameEn { get; set; } = default!;

    [Required]
    [MaxLength(255)]
    [Column("name_local")]
    public string NameLocal { get; set; } = default!;

    [MaxLength(500)]
    [Column("route_path")]
    public string? RoutePath { get; set; }

    [Column("sort_order")]
    public int? SortOrder { get; set; }

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

    public ICollection<SuProgram>? ChildPrograms { get; set; }
    public ICollection<SuBusinessRoleProgram>? SuBusinessRolePrograms { get; set; }
}
