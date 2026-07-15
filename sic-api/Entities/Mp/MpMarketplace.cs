using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace sic_api.Entities.Mp;

[Table("mp_marketplace")]
[Index(nameof(AppCode), IsUnique = true)]
public class MpMarketplace : BaseBusinessEntity
{
    [Required]
    [MaxLength(50)]
    [Column("app_code")]
    public string AppCode { get; set; } = default!;

    [Required]
    [MaxLength(200)]
    [Column("app_name")]
    public string AppName { get; set; } = default!;

    public ICollection<MpEntity> Entities { get; set; } = new List<MpEntity>();

    public ICollection<MpProgram> Programs { get; set; } = new List<MpProgram>();
}