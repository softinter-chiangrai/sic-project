using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using sic_api.Entities.Su;

namespace sic_api.Data.Entites.Su.Configurations;

public class SuBusinessRoleConfiguration : IEntityTypeConfiguration<SuBusinessRole>
{
    public void Configure(EntityTypeBuilder<SuBusinessRole> builder)
    {
        builder.HasIndex(x => new {x.BusinessId, x.RoleCode})
            .IsUnique()
            .HasFilter("is_delete = false");
    }
}