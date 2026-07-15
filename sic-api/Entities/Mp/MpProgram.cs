using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace sic_api.Entities.Mp;

[Table("mp_program")]
[Index(nameof(MarketplaceId), nameof(ProgramCode), IsUnique = true)]
public class MpProgram : BaseBusinessEntity
{
    [Required]
    [Column("marketplace_id")]
    public Guid MarketplaceId { get; set; }

    [ForeignKey(nameof(MarketplaceId))]
    public MpMarketplace Marketplace { get; set; } = default!;

    [Required]
    [Column("entity_id")]
    public Guid EntityId { get; set; }

    [ForeignKey(nameof(EntityId))]
    public MpEntity Entity { get; set; } = default!;

    [Required]
    [MaxLength(50)]
    [Column("program_code")]
    public string ProgramCode { get; set; } = default!;

    [Required]
    [MaxLength(100)]
    [Column("icon")]
    public string Icon { get; set; } = default!;

    [Required]
    [MaxLength(200)]
    [Column("name_en")]
    public string NameEn { get; set; } = default!;

    [Required]
    [MaxLength(200)]
    [Column("name_local")]
    public string NameLocal { get; set; } = default!;

    [Required]
    [MaxLength(100)]
    [Column("template")]
    public string Template { get; set; } = default!;
}