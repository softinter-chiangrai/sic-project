using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace sic_api.Entities.Su;

[Index(nameof(ProgramCode), IsUnique = true)]
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

    public ICollection<SuProgram>? ChildPrograms { get; set; }
    public ICollection<SuBusinessRoleProgram>? SuBusinessRolePrograms { get; set; }
}
