using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;
using sic_api.Entities;
using sic_api.Extensions;

namespace sic_api.Data;

public partial class SicDbContext : DbContext
{
    private readonly IHttpContextAccessor httpContextAccessor;

    // Reads the server-resolved business id set by BusinessContextMiddleware.
    // Never sourced from client-supplied headers — tamper-proof by design.
    private Guid? CurrentBusinessId =>
        httpContextAccessor.HttpContext?.Items[BusinessContextKeys.ActiveBusinessId] is Guid id
            ? id
            : (Guid?)null;

    public SicDbContext(
        DbContextOptions<SicDbContext> options,
        IHttpContextAccessor httpContextAccessor) : base(options)
    {
        this.httpContextAccessor = httpContextAccessor;
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        ConfigureDbModule(modelBuilder);
        ConfigureExModule(modelBuilder);
        ConfigureSuModule(modelBuilder);

        ApplyRowVersionConfiguration(modelBuilder);
        ApplyGlobalQueryFilters(modelBuilder);
    }

    private static void ApplyRowVersionConfiguration(ModelBuilder modelBuilder)
    {
        foreach (var clrType in modelBuilder.Model.GetEntityTypes().Select(entityType => entityType.ClrType))
        {
            if (typeof(BaseEntity).IsAssignableFrom(clrType))
            {
                modelBuilder.Entity(clrType)
                    .Property(nameof(BaseEntity.RowVersion))
                    .IsRowVersion();
                continue;
            }

            if (typeof(BaseBusinessEntity).IsAssignableFrom(clrType))
            {
                modelBuilder.Entity(clrType)
                    .Property(nameof(BaseBusinessEntity.RowVersion))
                    .IsRowVersion();
            }
        }
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        ApplyAudit();
        return base.SaveChangesAsync(cancellationToken);
    }

    public override int SaveChanges()
    {
        ApplyAudit();
        return base.SaveChanges();
    }

    private void ApplyAudit()
    {
        var now = DateTime.UtcNow;
        var currentActor = GetCurrentActor();
        var businessId = CurrentBusinessId;

        ApplyAuditForBaseEntity(now, currentActor);
        ApplyAuditForBaseBusinessEntity(now, currentActor, businessId);
    }

    private void ApplyAuditForBaseEntity(DateTime now, string currentActor)
    {
        var entries = ChangeTracker.Entries<BaseEntity>();

        foreach (var entry in entries)
        {
            if (entry.State == EntityState.Added)
            {
                entry.Entity.CreatedDate = now;
                entry.Entity.UpdatedDate = now;
                entry.Entity.IsDelete = false;
                entry.Entity.DeleteBy = null;
                entry.Entity.DeleteDate = null;
            }

            if (entry.State == EntityState.Modified)
            {
                entry.Entity.UpdatedDate = now;
            }

            if (entry.State == EntityState.Deleted)
            {
                entry.State = EntityState.Modified;
                entry.Entity.IsDelete = true;
                entry.Entity.DeleteBy = currentActor;
                entry.Entity.DeleteDate = now;
                entry.Entity.UpdatedDate = now;
            }
        }
    }

    private void ApplyAuditForBaseBusinessEntity(DateTime now, string currentActor, Guid? businessId)
    {
        var entries = ChangeTracker.Entries<BaseBusinessEntity>();

        foreach (var entry in entries)
        {
            if (entry.State == EntityState.Added)
            {
                entry.Entity.CreatedDate = now;
                entry.Entity.UpdatedDate = now;
                entry.Entity.IsDelete = false;
                entry.Entity.DeleteBy = null;
                entry.Entity.DeleteDate = null;

                if (businessId.HasValue)
                {
                    entry.Entity.BusinessId = businessId.Value;
                }
            }

            if (entry.State == EntityState.Modified)
            {
                entry.Entity.UpdatedDate = now;
            }

            if (entry.State == EntityState.Deleted)
            {
                entry.State = EntityState.Modified;
                entry.Entity.IsDelete = true;
                entry.Entity.DeleteBy = currentActor;
                entry.Entity.DeleteDate = now;
                entry.Entity.UpdatedDate = now;
            }
        }
    }

    private string GetCurrentActor()
    {
        var user = httpContextAccessor.HttpContext?.User;
        if (user?.Identity?.IsAuthenticated != true)
        {
            return "system";
        }

        return user.FindFirst("sub")?.Value
            ?? "system";
    }

    private void ApplyGlobalQueryFilters(ModelBuilder modelBuilder)
    {
        foreach (var clrType in modelBuilder.Model.GetEntityTypes().Select(entityType => entityType.ClrType))
        {
            if (typeof(BaseBusinessEntity).IsAssignableFrom(clrType))
            {
                modelBuilder.Entity(clrType).HasQueryFilter(BuildBaseBusinessEntityFilter(clrType));
                continue;
            }

            if (typeof(BaseEntity).IsAssignableFrom(clrType))
            {
                modelBuilder.Entity(clrType).HasQueryFilter(BuildBaseEntityFilter(clrType));
            }
        }
    }

    private static LambdaExpression BuildBaseEntityFilter(Type entityType)
    {
        var parameter = Expression.Parameter(entityType, "e");
        var isDeleteProperty = Expression.Property(parameter, nameof(BaseEntity.IsDelete));
        var compare = Expression.Equal(isDeleteProperty, Expression.Constant(false));
        return Expression.Lambda(compare, parameter);
    }

    private LambdaExpression BuildBaseBusinessEntityFilter(Type entityType)
    {
        var parameter = Expression.Parameter(entityType, "e");

        // 1. IsDelete Filter (This part is fine)
        var isDeleteProperty = Expression.Property(parameter, nameof(BaseBusinessEntity.IsDelete));
        var activeCompare = Expression.Equal(isDeleteProperty, Expression.Constant(false));

        // 2. BusinessId Filter (The part that needs fixing)
        var businessIdProperty = Expression.Property(parameter, nameof(BaseBusinessEntity.BusinessId));
        
        // Convert businessIdProperty (Guid) to Nullable<Guid> so it matches CurrentBusinessId
        var nullableBusinessIdProperty = Expression.Convert(businessIdProperty, typeof(Guid?));
        
        var currentBusinessId = Expression.Property(Expression.Constant(this), nameof(CurrentBusinessId));
        
        // Now both sides are Nullable<Guid>
        var businessCompare = Expression.Equal(nullableBusinessIdProperty, currentBusinessId);

        var filter = Expression.AndAlso(activeCompare, businessCompare);
        return Expression.Lambda(filter, parameter);
    }

}
