using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using sic_api.Entities.Su;

namespace sic_api.Data.Entites.Su.Configurations;

public class SuBusinessConfiguration : IEntityTypeConfiguration<SuBusiness>
{
    public void Configure(EntityTypeBuilder<SuBusiness> builder)
    {
        builder.HasIndex(x => x.BusinessCode)
            .IsUnique()
            .HasFilter("is_delete = false");
    }
}