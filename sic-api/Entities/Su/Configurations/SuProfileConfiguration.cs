using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using sic_api.Entities.Su;

namespace sic_api.Data.Entites.Su.Configurations;

public class SuProfileConfiguration : IEntityTypeConfiguration<SuProfile>
{
    public void Configure(EntityTypeBuilder<SuProfile> builder)
    {

        builder.HasIndex(x => x.UserId)
            .IsUnique()
            .HasFilter("is_delete = false");
            
    }
}