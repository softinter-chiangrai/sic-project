using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using sic_api.Entities;

namespace sic_api.Entities.Su;

[Table("su_chat_group_member")]
public class SuChatGroupMember : BaseBusinessEntity
{
    [Required]
    [Column("group_id")]
    public Guid GroupId { get; set; }

    [Required]
    [MaxLength(100)]
    [Column("user_id")]
    public string UserId { get; set; } = default!;

    public SuChatGroup? Group { get; set; }
}
