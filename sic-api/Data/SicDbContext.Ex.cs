using Microsoft.EntityFrameworkCore;
using sic_api.Entities.Ex;

namespace sic_api.Data;

public partial class SicDbContext
{
    public DbSet<ExExample> ExExamples => Set<ExExample>();

    private static void ConfigureExModule(ModelBuilder modelBuilder)
    {
        // Ex entities currently rely on attribute-based mapping only.
    }
}