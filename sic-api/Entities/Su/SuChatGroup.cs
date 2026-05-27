using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using sic_api.Entities;

namespace sic_api.Entities.Su;

[Table("su_chat_group")]
public class SuChatGroup : BaseBusinessEntity
{
    [Required]
    [MaxLength(200)]
    [Column("name")]
    public string Name { get; set; } = default!;

    public ICollection<SuChatGroupMember> Members { get; set; } = [];
    public ICollection<SuChatGroupLog> Messages { get; set; } = [];
}
