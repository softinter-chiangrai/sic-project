using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using sic_api.Model.Storage;

namespace sic_api.Entities.Su;

[Index(nameof(BucketName))]
[Index(nameof(ObjectKey))]
[Table("su_upload")]
public class SuUpload : BaseEntity
{
    [Column("bussiness_id")]
    public Guid? BusinessId { get; set; }

    [Required]
    [MaxLength(100)]
    [Column("bucket_name")]
    public string BucketName { get; set; } = default!;

    [Required]
    [MaxLength(1000)]
    [Column("object_key")]
    public string ObjectKey { get; set; } = default!;

    [Required]
    [MaxLength(255)]
    [Column("file_name")]
    public string FileName { get; set; } = default!;

    [Required]
    [MaxLength(255)]
    [Column("content_type")]
    public string ContentType { get; set; } = default!;

    [Required]
    [Column("file_size")]
    public long FileSize { get; set; } = 0;

    [Required]
    [MaxLength(50)]
    [Column("category")]
    public string Category { get; set; } = default!;

    [Required]
    [Column("visibility")]
    public FileVisibility Visibility { get; set; }

    [Required]
    [MaxLength(2000)]
    [Column("storage_url")]
    public string StorageUrl { get; set; } = default!;

    [Required]
    [MaxLength(2000)]
    [Column("access_url")]
    public string AccessUrl { get; set; } = default!;

    [Required]
    [Column("is_streaming")]
    public bool IsStreaming { get; set; } = false;

    [Required]
    [Column("is_active")]
    public bool IsActive { get; set; } = false;

    [Column("upload_group_id")]
    public Guid? UploadGroupId { get; set; } = null;

    [Column("temp_expires_at")]
    public DateTime? TempExpiresAt { get; set; }
}
