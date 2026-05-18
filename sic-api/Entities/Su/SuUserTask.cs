using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace sic_api.Entities.Su;

[Table("su_user_task")]
public class SuUserTask : BaseBusinessEntity
{
    [Required]
    [MaxLength(100)]
    [Column("title")]
    public string Title { get; set; } = default!;

    [Column("start_time")]
    public DateTime? StartTime { get; set; }

    [Column("end_time")]
    public DateTime? EndTime { get; set; }

    [MaxLength(2000)]
    [Column("description")]
    public string? Description { get; set; }

    [Required]
    [ForeignKey(nameof(Task))]
    [Column("task_id")]
    public Guid TaskId { get; set; }
    public SuTask Task { get; set; } = default!;
}