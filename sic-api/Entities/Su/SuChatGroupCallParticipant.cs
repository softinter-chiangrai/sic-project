using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using sic_api.Entities;

namespace sic_api.Entities.Su;

/// <summary>Tracks which users were present in a group call.</summary>
[Table("su_chat_group_call_participant")]
public class SuChatGroupCallParticipant : BaseEntity
{
    [Required]
    [Column("log_id")]
    public Guid LogId { get; set; }

    [Required]
    [MaxLength(100)]
    [Column("user_id")]
    public string UserId { get; set; } = default!;

    public SuChatGroupLog? Log { get; set; }
}
