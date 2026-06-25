using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace sic_api.Entities.Mp;
[Table("MP_ENTITY")]
[Index(nameof(MarketplaceId), nameof(Name), IsUnique = true)]
public class MpEntity : BaseBusinessEntity
{
    [Required]
    [Column("marketplace_id")]
    public Guid MarketplaceId { get; set; }

    [ForeignKey(nameof(MarketplaceId))]
    public MpMarketplace Marketplace { get; set; } = default!;

    [Required]
    [MaxLength(100)]
    [Column("name")]
    public string Name { get; set; } = default!;

    [Required]
    [MaxLength(200)]
    [Column("description")]
    public string Description { get; set; } = default!;

    [Required]
    [MaxLength(200)]
    [Column("label_en")]
    public string LabelEn { get; set; } = default!;

    [Required]
    [MaxLength(200)]
    [Column("label_local")]
    public string LabelLocal { get; set; } = default!;

    public ICollection<MpEntityField> Fields { get; set; } = new List<MpEntityField>();

    public ICollection<MpEntityConstraint> Constraints { get; set; } = new List<MpEntityConstraint>();

    public ICollection<MpEntityBilingual> Bilinguals { get; set; } = new List<MpEntityBilingual>();

    public ICollection<MpEntityInitial> Initials { get; set; } = new List<MpEntityInitial>();
}