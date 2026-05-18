using sic_api.Entities.Db;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace sic_api.Entities.Su;

[Table("su_verify")]
public class SuVerify : BaseEntity
{

    [Required]
    [MaxLength(100)]
    [Column("verify_type")]
    public string VerifyType { get; set; } = default!;

    [Required]
    [MaxLength(300)]
    [Column("reference_number")]
    public string ReferenceNumber { get; set; } = default!;

    [Required]
    [MaxLength(300)]
    [Column("token")]
    public string Token { get; set; } = default!;

    [Required]
    [MaxLength(300)]
    [Column("max_retry")]
    public int MaxRetry { get; set; } = 5;

    [Required]
    [Column("retry_count")]
    public int RetryCount { get; set; } = 0;

    [Required]
    [Column("expire_at")]
    public DateTime ExpireAt { get; set; }

    [Required]
    [MaxLength(255)]
    [Column("recipient")]
    public string Recipient { get; set; } = default!;


}
