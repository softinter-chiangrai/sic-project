using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace sic_api.Entities;

public abstract class BaseBusinessEntity
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; } = Guid.CreateVersion7();

    [Required]
    [MaxLength(100)]
    [Column("created_by")]
    public string CreatedBy { get; set; } = "system";

    [Required]
    [Column("created_date")]
    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

    [Required]
    [MaxLength(100)]
    [Column("updated_by")]
    public string UpdatedBy { get; set; } = "system";

    [Required]
    [Column("updated_date")]
    public DateTime UpdatedDate { get; set; } = DateTime.UtcNow;

    [Required]
    [Column("is_delete")]
    public bool IsDelete { get; set; } = false;

    [MaxLength(100)]
    [Column("delete_by")]
    public string? DeleteBy { get; set; }

    [Column("delete_date")]
    public DateTime? DeleteDate { get; set; }

    [Required]
    [MaxLength(100)]
    [Column("business_id")]
    public Guid BusinessId { get; set; }

    public uint RowVersion { get; set; }

    [NotMapped]
    public EntityState State { get; set; } = EntityState.Detached;
}
