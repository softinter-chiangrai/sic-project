using AutoMapper;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using sic_api.Data;
using sic_api.Entities.Ex;
using sic_api.Mapping;
using sic_api.Model;

namespace sic_api.Features.Ex.Example;

public static class SaveExExample
{
    public class Command : BaseModelState, IRequest<Guid?>, IMapFrom<ExExample>
    {
        public Guid? Id { get; set; }
        public string ExampleCode { get; set; } = default!;

        public string MessageEn { get; set; } = default!;

        public string MessageLocal { get; set; } = default!;

        public DateTime StartDate { get; set; } = default!;

        public DateTime EndDate { get; set; } = default!;

        public long Total { get; set; } = default!;

        public bool IsActive { get; set; } = true;

        public void Mapping(Profile profile)
        {
            profile.CreateMap<Command, ExExample>()
                .ForMember(destination => destination.RowVersion, options => options.Ignore());
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

            RuleFor(x => x.ExampleCode).NotEmpty().MaximumLength(50);
            RuleFor(x => x.MessageEn).NotEmpty();
            RuleFor(x => x.MessageLocal).NotEmpty();
            RuleFor(x => x.StartDate).NotEmpty();
            RuleFor(x => x.EndDate).NotEmpty();
            RuleFor(x => x.Total).NotEmpty();
        }
    }

    public sealed class Handler(SicDbContext dbContext, IMapper mapper) : IRequestHandler<Command, Guid?>
    {
        public async Task<Guid?> Handle(Command request, CancellationToken cancellationToken)
        {
            var entity = mapper.Map<ExExample>(request);

            var item = entity.State switch
            {
                EntityState.Added => entity,
                EntityState.Modified => await dbContext.ExExamples
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
                dbContext.ExExamples.Add(item);
            }

            await dbContext.SaveChangesAsync(cancellationToken);
            return item.Id;
        }
    }
}
