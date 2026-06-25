using Microsoft.EntityFrameworkCore;
using sic_api.Entities.Mp;
using sic_api.Entities.Su;

namespace sic_api.Data;


public partial class SicDbContext
{
    public DbSet<MpBusinessEntityTable> MpBusinessEntityTables => Set<MpBusinessEntityTable>();
    public DbSet<MpBusinessMarketplace> MpBusinessMarketplaces => Set<MpBusinessMarketplace>();
    public DbSet<MpEntity> MpEntities => Set<MpEntity>();
    public DbSet<MpEntityBilingual> MpEntityBilinguals => Set<MpEntityBilingual>();
    public DbSet<MpEntityConstraint> MpEntityConstraints => Set<MpEntityConstraint>();
    public DbSet<MpEntityField> MpEntityFields => Set<MpEntityField>();
    public DbSet<MpEntityInitial> MpEntityInitials => Set<MpEntityInitial>();
    public DbSet<MpMarketplace> MpMarketplaces => Set<MpMarketplace>();
    public DbSet<MpProgram> MpPrograms => Set<MpProgram>();

}