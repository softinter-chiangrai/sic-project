using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace sic_api.Entities.Mp;

[Table("mp_entity_bilingual")]
[Index(nameof(EntityId), nameof(Key), IsUnique = true)]
public class MpEntityBilingual : BaseBusinessEntity
{
    [Required]
    [Column("entity_id")]
    public Guid EntityId { get; set; }

    [ForeignKey(nameof(EntityId))]
    public MpEntity Entity { get; set; } = default!;

    [Required]
    [MaxLength(100)]
    [Column("key")]
    public string Key { get; set; } = default!;

    [Required]
    [MaxLength(100)]
    [Column("key_en")]
    public string KeyEn { get; set; } = default!;

    [Required]
    [MaxLength(100)]
    [Column("key_local")]
    public string KeyLocal { get; set; } = default!;
}