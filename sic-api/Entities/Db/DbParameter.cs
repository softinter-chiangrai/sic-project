using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace sic_api.Entities.Db;

[Index(nameof(ModuleCode), nameof(ParameterCode), nameof(ParameterValue), IsUnique = true)]
[Table("db_parameter")]
public class DbParameter : BaseEntity
{

    [Required]
    [MaxLength(50)]
    [Column("module_code")]
    public string ModuleCode { get; set; } = default!;

    [Required]
    [MaxLength(50)]
    [Column("parameter_code")]
    public string ParameterCode { get; set; } = default!;

    [Required]
    [MaxLength(50)]
    [Column("parameter_value")]
    public string ParameterValue { get; set; } = default!;

    [Required]
    [MaxLength(100)]
    [Column("parameter_name_en")]
    public string ParameterNameEn { get; set; } = default!;

    [Required]
    [MaxLength(100)]
    [Column("parameter_name_local")]
    public string ParameterNameLocal { get; set; } = default!;

    [Required]
    [Column("is_active")]
    public bool IsActive { get; set; } = false;

    [Column("sort_order")]
    public int? SortOrder { get; set; }
    
}