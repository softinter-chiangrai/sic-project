using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace sic_api.Entities.Su;

public enum ChatMessageType
{
    Text = 0,
    Image = 1,
    File = 2,
}

[Table("su_chat_log")]
[Index(nameof(BusinessId), nameof(SenderId), nameof(ReceiverId))]
public class SuChatLog : BaseBusinessEntity
{
    [Required]
    [MaxLength(100)]
    [Column("sender_id")]
    public string SenderId { get; set; } = default!;

    [Required]
    [MaxLength(100)]
    [Column("receiver_id")]
    public string ReceiverId { get; set; } = default!;

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

    public SuUpload? Attachment { get; set; }
}
