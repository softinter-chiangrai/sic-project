using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using sic_api.Entities.Su;

namespace sic_api.Data.Entites.Su.Configurations;

public class SuMessageConfiguration : IEntityTypeConfiguration<SuMessage>
{
    public void Configure(EntityTypeBuilder<SuMessage> builder)
    {

        builder.HasIndex(x => new { x.ModuleCode, x.ProgramCode, x.MessageCode})
            .IsUnique()
            .HasFilter("is_delete = false");
            
    }
}