using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace sic_api.Entities.Mp;

[Table("MP_ENTITY_FIELD")]
[Index(nameof(EntityId), nameof(Name), IsUnique = true)]
[Index(nameof(EntityId), nameof(Field), IsUnique = true)]
public class MpEntityField : BaseBusinessEntity
{
    [Required]
    [Column("entity_id")]
    public Guid EntityId { get; set; }

    [ForeignKey(nameof(EntityId))]
    public MpEntity Entity { get; set; } = default!;

    [Required]
    [MaxLength(100)]
    [Column("name")]
    public string Name { get; set; } = default!;

    [Required]
    [MaxLength(100)]
    [Column("field")]
    public string Field { get; set; } = default!;

    [Required]
    [MaxLength(50)]
    [Column("type")]
    public string Type { get; set; } = default!;

    [MaxLength(200)]
    [Column("format")]
    public string? Format { get; set; }

    [Required]
    [Column("is_required")]
    public bool IsRequired { get; set; }

    [Required]
    [MaxLength(200)]
    [Column("label_en")]
    public string LabelEn { get; set; } = default!;

    [Required]
    [MaxLength(200)]
    [Column("label_local")]
    public string LabelLocal { get; set; } = default!;

    [MaxLength(200)]
    [Column("reference_entity")]
    public string? ReferenceEntity { get; set; }

    [Column("seq_no")]
    public int SeqNo { get; set; }
}