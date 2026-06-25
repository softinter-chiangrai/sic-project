using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace sic_api.Entities.Mp;

[Table("MP_ENTITY_INITIAL")]
public class MpEntityInitial : BaseBusinessEntity
{
    [Required]
    [Column("entity_id")]
    public Guid EntityId { get; set; }

    [ForeignKey(nameof(EntityId))]
    public MpEntity Entity { get; set; } = default!;

    [Required]
    [Column("data_json", TypeName = "jsonb")]
    public string DataJson { get; set; } = "{}";

    [Column("seq_no")]
    public int SeqNo { get; set; }
}