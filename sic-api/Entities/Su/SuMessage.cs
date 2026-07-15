using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace sic_api.Entities.Su;

[Table("su_message")]
public class SuMessage : BaseEntity
{
    [Required]
    [MaxLength(10)]
    [Column("module_code")]
    public string ModuleCode { get; set; } = default!;

    [Required]
    [MaxLength(50)]
    [Column("program_code")]
    public string ProgramCode { get; set; } = default!;

    [Required]
    [MaxLength(50)]
    [Column("message_code")]
    public string MessageCode { get; set; } = default!;

    [Required]
    [MaxLength(255)]
    [Column("message_en")]
    public string MessageEn { get; set; } = default!;

    [Required]
    [MaxLength(255)]
    [Column("message_local")]
    public string MessageLocal { get; set; } = default!;



}
