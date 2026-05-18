using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace sic_api.Entities.Su;

[Table("su_task")]
public class SuTask : BaseBusinessEntity
{
    [Required]
    [MaxLength(20)]
    [Column("task_code")]
    public string TaskCode { get; set; } = default!;

    [MaxLength(255)]
    [Column("task_name_en")]
    public string? TaskNameEn { get; set; }

    [MaxLength(255)]
    [Column("task_name_local")]
    public string? TaskNameLocal { get; set; }

    [Column("is_active")]
    public bool IsActive { get; set; } = false;

    public ICollection<SuUserTask>? UserTasks { get; set; }
}