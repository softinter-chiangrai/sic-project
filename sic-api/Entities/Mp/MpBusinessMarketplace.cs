using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace sic_api.Entities.Mp;

[Table("MP_BUSINESS_MARKETPLACE")]
[Index(nameof(BusinessId), nameof(MarketplaceId))]
public class MpBusinessMarketplace : BaseBusinessEntity
{
    [Required]
    [Column("marketplace_id")]
    public Guid MarketplaceId { get; set; }

    [ForeignKey(nameof(MarketplaceId))]
    public MpMarketplace Marketplace { get; set; } = default!;

    [Required]
    [MaxLength(50)]
    [Column("install_status")]
    public string InstallStatus { get; set; } = "INSTALLED";

    [Required]
    [Column("installed_date")]
    public DateTime InstalledDate { get; set; } = DateTime.UtcNow;
}