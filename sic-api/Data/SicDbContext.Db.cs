using Microsoft.EntityFrameworkCore;
using sic_api.Entities.Db;

namespace sic_api.Data;

public partial class SicDbContext
{
    public DbSet<DbCountry> DbCountries => Set<DbCountry>();
    public DbSet<DbProvince> DbProvinces => Set<DbProvince>();
    public DbSet<DbDistrict> DbDistricts => Set<DbDistrict>();
    public DbSet<DbSubDistrict> DbSubDistricts => Set<DbSubDistrict>();
    public DbSet<DbParameter> DbParameters => Set<DbParameter>();
    public DbSet<DbTitle> DbTitles => Set<DbTitle>();
    public DbSet<DbMailConfig> DbMailConfigs => Set<DbMailConfig>();
    public DbSet<DbMailTemplate> DbMailTemplates => Set<DbMailTemplate>();
    public DbSet<DbMailQueue> DbMailQueues => Set<DbMailQueue>();

    private static void ConfigureDbModule(ModelBuilder modelBuilder)
    {
        // Db entities currently rely on attribute-based mapping only.
    }
}