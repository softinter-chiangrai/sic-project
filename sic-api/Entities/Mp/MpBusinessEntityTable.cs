using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace sic_api.Entities.Mp;

[Table("mp_business_entity_table")]
[Index(nameof(BusinessId), nameof(EntityId))]
[Index(nameof(TableName))]
public class MpBusinessEntityTable : BaseBusinessEntity
{
    [Required]
    [Column("entity_id")]
    public Guid EntityId { get; set; }

    [ForeignKey(nameof(EntityId))]
    public MpEntity Entity { get; set; } = default!;

    [Required]
    [MaxLength(100)]
    [Column("table_name")]
    public string TableName { get; set; } = default!;

    [Required]
    [MaxLength(50)]
    [Column("status")]
    public string Status { get; set; } = "ACTIVE";
}