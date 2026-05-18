using AutoMapper;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using sic_api.Data;
using sic_api.Entities.Su;
using sic_api.Mapping;
using sic_api.Model;
using sic_api.Services.Interfaces;

namespace sic_api.Features.Su.UserBusinessRole;

public static class SaveSuUserBusinessRole
{
    public class Command : BaseModelState, IRequest<Guid?>, IMapFrom<SuUserBusinessRole>
    {
        public Guid? Id { get; set; }
        public Guid UserBusinessId { get; set; }
        public Guid BusinessRoleId { get; set; }
        public bool IsPrimary { get; set; }
        public bool IsActive { get; set; } = true;

        public void Mapping(Profile profile)
        {
            profile.CreateMap<Command, SuUserBusinessRole>()
                .ForMember(destination => destination.RowVersion, options => options.Ignore())
                .ForMember(destination => destination.UserBusiness, options => options.Ignore())
                .ForMember(destination => destination.BusinessRole, options => options.Ignore());
        }
    }

    public class Validator : AbstractValidator<Command>
    {
        public Validator()
        {
            RuleFor(x => x.State)
                .Must(state => state is EntityState.Added or EntityState.Modified)
                .WithMessage("State must be Added or Modified.");

            RuleFor(x => x.Id)
                .NotEmpty()
                .When(x => x.State == EntityState.Modified)
                .WithMessage("Id is required when state is Modified.");

            RuleFor(x => x.RowVersion)
                .NotNull()
                .When(x => x.State == EntityState.Modified)
                .WithMessage("RowVersion is required when state is Modified.");

            RuleFor(x => x.UserBusinessId).NotEmpty();
            RuleFor(x => x.BusinessRoleId).NotEmpty();
        }
    }

    public sealed class Handler(
        SicDbContext dbContext,
        IMapper mapper,
        IProgramAccessService programAccessService) : IRequestHandler<Command, Guid?>
    {
        public async Task<Guid?> Handle(Command request, CancellationToken cancellationToken)
        {
            var entity = mapper.Map<SuUserBusinessRole>(request);

            var item = entity.State switch
            {
                EntityState.Added => entity,
                EntityState.Modified => await dbContext.SuUserBusinessRoles
                    .FirstOrDefaultAsync(x => x.Id == entity.Id, cancellationToken),
                _ => null
            };

            if (item is null)
            {
                return null;
            }

            if (entity.State == EntityState.Modified)
            {
                dbContext.Entry(item).Property(x => x.RowVersion).OriginalValue = request.RowVersion!.Value;
                mapper.Map(request, item);
            }

            if (entity.State == EntityState.Added)
            {
                dbContext.SuUserBusinessRoles.Add(item);
            }

            await dbContext.SaveChangesAsync(cancellationToken);
            await InvalidateAccessCacheAsync(dbContext, programAccessService, item.UserBusinessId, cancellationToken);
            return item.Id;
        }
    }

    internal static async Task InvalidateAccessCacheAsync(
        SicDbContext dbContext,
        IProgramAccessService programAccessService,
        Guid userBusinessId,
        CancellationToken cancellationToken)
    {
        var cacheInfo = await dbContext.SuUserBusinesses
            .AsNoTracking()
            .Where(x => x.Id == userBusinessId)
            .Select(x => new
            {
                x.KeycloakUserId,
                x.Business.Id
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (cacheInfo is not null)
        {
            programAccessService.RemoveAccessCache(cacheInfo.KeycloakUserId, cacheInfo.Id);
        }
    }
}
