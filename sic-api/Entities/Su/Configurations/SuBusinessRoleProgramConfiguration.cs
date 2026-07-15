using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using sic_api.Entities.Su;

namespace sic_api.Data.Entites.Su.Configurations;

public class SuBusinessRoleProgramConfiguration : IEntityTypeConfiguration<SuBusinessRoleProgram>
{
    public void Configure(EntityTypeBuilder<SuBusinessRoleProgram> builder)
    {
        builder.HasIndex(x => new {x.BusinessRoleId, x.ProgramId})
            .IsUnique()
            .HasFilter("is_delete = false");
    }
}