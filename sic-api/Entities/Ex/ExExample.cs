using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using sic_api.Attributes;
using sic_api.Model.Storage;

namespace sic_api.Entities.Ex;

[Table("ex_example")]
public class ExExample : BaseEntity
{
    [Required]
    [MaxLength(50)]
    [Column("example_code")]
    public string ExampleCode { get; set; } = default!;

    [Required]
    [Column("message_en")]
    public string MessageEn { get; set; } = default!;

    [Required]
    [Column("message_local")]
    public string MessageLocal { get; set; } = default!;

    [Required]
    [Column("start_date")]
    public DateTime StartDate { get; set; }

    [Required]
    [Column("end_date")]
    public DateTime EndDate { get; set; }

    [Column("start_time")]
    public string? StartTime { get; set; }

    [Column("end_time")]
    public string? EndTime { get; set; }

    [Column("is_accept")]
    public string? IsAccept { get; set; }

    [Column("color")]
    public string? Color { get; set; }

    [Column("country_code")]
    public string? CountryCode { get; set; }

    [Required]
    [Column("total")]
    public long Total { get; set; }

    [Column("upload_group_id")]
    [Storage("UploadGroupData")]
    public Guid? UploadGroupId { get; set; }

    [Required]
    [Column("is_active")]
    public bool IsActive { get; set; } = false;

    [NotMapped]
    public List<StorageUploadReference>? UploadGroupData { get; set; }
}
