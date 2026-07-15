using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using sic_api.Entities.Su;

namespace sic_api.Data.Entites.Su.Configurations;

public class SuUserBusinessRoleConfiguration : IEntityTypeConfiguration<SuUserBusinessRole>
{
    public void Configure(EntityTypeBuilder<SuUserBusinessRole> builder)
    {

        builder.HasIndex(x => new { x.UserBusinessId, x.BusinessRoleId})
            .IsUnique()
            .HasFilter("is_delete = false");
            
    }
}