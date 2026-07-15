using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using sic_api.Entities.Su;

namespace sic_api.Data.Entites.Su.Configurations;

public class SuProgramConfiguration : IEntityTypeConfiguration<SuProgram>
{
    public void Configure(EntityTypeBuilder<SuProgram> builder)
    {

        builder.HasIndex(x => x.ProgramCode)
            .IsUnique()
            .HasFilter("is_delete = false");
            
    }
}