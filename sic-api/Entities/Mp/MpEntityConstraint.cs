using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace sic_api.Entities.Mp;

[Table("mp_entity_constraint")]
public class MpEntityConstraint : BaseBusinessEntity
{
    [Required]
    [Column("entity_id")]
    public Guid EntityId { get; set; }

    [ForeignKey(nameof(EntityId))]
    public MpEntity Entity { get; set; } = default!;

    [Required]
    [MaxLength(50)]
    [Column("constraint_type")]
    public string ConstraintType { get; set; } = default!;

    [Required]
    [Column("fields_json", TypeName = "jsonb")]
    public string FieldsJson { get; set; } = "[]";
}