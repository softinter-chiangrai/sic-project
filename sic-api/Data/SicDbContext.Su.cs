using Microsoft.EntityFrameworkCore;
using sic_api.Entities.Su;

namespace sic_api.Data;


public partial class SicDbContext
{
    public DbSet<SuBusiness> SuBusinesses => Set<SuBusiness>();
    public DbSet<SuTask> SuTasks => Set<SuTask>();
    public DbSet<SuUserTask> SuUserTasks => Set<SuUserTask>();
    public DbSet<SuUserBusiness> SuUserBusinesses => Set<SuUserBusiness>();
    public DbSet<SuBusinessRole> SuBusinessRoles => Set<SuBusinessRole>();
    public DbSet<SuBusinessInvite> SuBusinessInvites => Set<SuBusinessInvite>();
    public DbSet<SuProgram> SuPrograms => Set<SuProgram>();
    public DbSet<SuBusinessRoleProgram> SuBusinessRolePrograms => Set<SuBusinessRoleProgram>();
    public DbSet<SuUserBusinessRole> SuUserBusinessRoles => Set<SuUserBusinessRole>();
    public DbSet<SuBusinessAudit> SuBusinessAudits => Set<SuBusinessAudit>();
    public DbSet<SuMessage> SuMessages => Set<SuMessage>();
    public DbSet<SuUpload> SuUploads => Set<SuUpload>();
    public DbSet<SuProfile> SuProfiles => Set<SuProfile>();
    public DbSet<SuVerify> SuVerifies => Set<SuVerify>();

    private static void ConfigureSuModule(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<SuUserBusiness>()
            .HasOne(x => x.Business)
            .WithMany(x => x.UserBusinesses)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<SuBusinessRole>()
            .HasOne(x => x.Business)
            .WithMany(x => x.BusinessRoles)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<SuBusinessRole>()
            .HasOne(x => x.ParentRole)
            .WithMany(x => x.ChildRoles)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<SuProgram>()
            .HasOne(x => x.ParentProgram)
            .WithMany(x => x.ChildPrograms)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<SuUserTask>()
            .HasOne(x => x.Task)
            .WithMany(x => x.UserTasks)
            .HasForeignKey(x => x.TaskId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}