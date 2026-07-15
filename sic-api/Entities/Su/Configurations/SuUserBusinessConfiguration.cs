using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using sic_api.Entities.Su;

namespace sic_api.Data.Entites.Su.Configurations;

public class SuUserBusinessConfiguration : IEntityTypeConfiguration<SuUserBusiness>
{
    public void Configure(EntityTypeBuilder<SuUserBusiness> builder)
    {

        builder.HasIndex(x => new { x.UserId, x.BusinessId})
            .IsUnique()
            .HasFilter("is_delete = false");
            
    }
}