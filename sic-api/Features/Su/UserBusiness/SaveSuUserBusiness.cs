using AutoMapper;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using sic_api.Data;
using sic_api.Entities.Su;
using sic_api.Mapping;
using sic_api.Model;

namespace sic_api.Features.Su.UserBusiness;

public static class SaveSuUserBusiness
{
    public class Command : BaseModelState, IRequest<Guid?>, IMapFrom<SuUserBusiness>
    {
        public Guid? Id { get; set; }
        public string UserId { get; set; } = default!;
        public Guid BusinessId { get; set; }
        public bool IsDefault { get; set; }
        public bool IsActive { get; set; } = true;

        public void Mapping(Profile profile)
        {
            profile.CreateMap<Command, SuUserBusiness>()
                .ForMember(destination => destination.RowVersion, options => options.Ignore())
                .ForMember(destination => destination.Business, options => options.Ignore())
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

            RuleFor(x => x.UserId).NotEmpty().MaximumLength(100);
            RuleFor(x => x.BusinessId).NotEmpty();
        }
    }

    public sealed class Handler(SicDbContext dbContext, IMapper mapper) : IRequestHandler<Command, Guid?>
    {
        public async Task<Guid?> Handle(Command request, CancellationToken cancellationToken)
        {
            var entity = mapper.Map<SuUserBusiness>(request);

            var item = entity.State switch
            {
                EntityState.Added => entity,
                EntityState.Modified => await dbContext.SuUserBusinesses
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
                dbContext.SuUserBusinesses.Add(item);
            }

            await dbContext.SaveChangesAsync(cancellationToken);
            return item.Id;
        }
    }
}
