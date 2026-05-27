using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using sic_api.Entities;

namespace sic_api.Entities.Su;

[Table("su_chat_group_log")]
public class SuChatGroupLog : BaseBusinessEntity
{
    [Required]
    [Column("group_id")]
    public Guid GroupId { get; set; }

    [Required]
    [MaxLength(100)]
    [Column("sender_id")]
    public string SenderId { get; set; } = default!;

    [Required]
    [MaxLength(4000)]
    [Column("message")]
    public string Message { get; set; } = string.Empty;

    [Required]
    [Column("message_type")]
    public ChatMessageType MessageType { get; set; } = ChatMessageType.Text;

    [Column("attachment_id")]
    public Guid? AttachmentId { get; set; }

    [Required]
    [Column("is_cancelled")]
    public bool IsCancelled { get; set; } = false;

    [Column("cancelled_at")]
    public DateTime? CancelledAt { get; set; }

    [MaxLength(100)]
    [Column("cancelled_by")]
    public string? CancelledBy { get; set; }

    public SuChatGroup? Group { get; set; }
    public SuUpload? Attachment { get; set; }
}
