using AutoMapper;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using sic_api.Data;
using sic_api.Entities.Su;
using sic_api.Mapping;
using sic_api.Model;
using sic_api.Services.Interfaces;

namespace sic_api.Features.Su.BusinessRole;

public static class SaveSuBusinessRole
{
    public class Command : BaseModelState, IRequest<Guid?>, IMapFrom<SuBusinessRole>
    {
        public Guid? Id { get; set; }
        public Guid BusinessId { get; set; }
        public Guid? ParentRoleId { get; set; }
        public string RoleCode { get; set; } = default!;
        public string RoleNameEn { get; set; } = default!;
        public string RoleNameLocal { get; set; } = default!;
        public string? RoleLevel { get; set; }
        public int SortOrder { get; set; }
        public bool IsActive { get; set; } = true;

        public void Mapping(Profile profile)
        {
            profile.CreateMap<Command, SuBusinessRole>()
                .ForMember(destination => destination.RowVersion, options => options.Ignore())
                .ForMember(destination => destination.Business, options => options.Ignore())
                .ForMember(destination => destination.ParentRole, options => options.Ignore())
                .ForMember(destination => destination.ChildRoles, options => options.Ignore())
                .ForMember(destination => destination.RolePrograms, options => options.Ignore())
                .ForMember(destination => destination.UserBusinessRoles, options => options.Ignore());
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

            RuleFor(x => x.BusinessId).NotEmpty();
            RuleFor(x => x.RoleCode).NotEmpty().MaximumLength(50);
            RuleFor(x => x.RoleNameEn).NotEmpty().MaximumLength(255);
            RuleFor(x => x.RoleNameLocal).NotEmpty().MaximumLength(255);
            RuleFor(x => x.RoleLevel).MaximumLength(50);
        }
    }

    public sealed class Handler(
        SicDbContext dbContext,
        IMapper mapper,
        IProgramAccessService programAccessService) : IRequestHandler<Command, Guid?>
    {
        public async Task<Guid?> Handle(Command request, CancellationToken cancellationToken)
        {
            var entity = mapper.Map<SuBusinessRole>(request);

            var item = entity.State switch
            {
                EntityState.Added => entity,
                EntityState.Modified => await dbContext.SuBusinessRoles
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
                dbContext.SuBusinessRoles.Add(item);
            }

            await dbContext.SaveChangesAsync(cancellationToken);

            var businessId = await dbContext.SuBusinesses
                .AsNoTracking()
                .Where(x => x.Id == item.BusinessId)
                .Select(x => x.Id)
                .FirstOrDefaultAsync(cancellationToken);

            if (businessId != Guid.Empty)
            {
                programAccessService.RemoveAccessCacheByBusiness(businessId);
            }

            return item.Id;
        }
    }
}
