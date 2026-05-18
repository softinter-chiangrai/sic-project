using AutoMapper;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using sic_api.Data;
using sic_api.Entities.Su;
using sic_api.Mapping;
using sic_api.Model;
using sic_api.Services.Interfaces;

namespace sic_api.Features.Su.Program;

public static class SaveSuProgram
{
    public class Command : BaseModelState, IRequest<Guid?>, IMapFrom<SuProgram>
    {
        public Guid? Id { get; set; }
        public Guid? ParentProgramId { get; set; }
        public string ProgramCode { get; set; } = default!;
        public string? Icon { get; set; }
        public string NameEn { get; set; } = default!;
        public string NameLocal { get; set; } = default!;
        public string? RoutePath { get; set; }
        public int SortOrder { get; set; }
        public bool IsActive { get; set; } = true;

        public void Mapping(Profile profile)
        {
            profile.CreateMap<Command, SuProgram>()
                .ForMember(destination => destination.RowVersion, options => options.Ignore())
                .ForMember(destination => destination.ParentProgram, options => options.Ignore())
                .ForMember(destination => destination.ChildPrograms, options => options.Ignore())
                .ForMember(destination => destination.SuBusinessRolePrograms, options => options.Ignore());
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

            RuleFor(x => x.ProgramCode).NotEmpty().MaximumLength(50);
            RuleFor(x => x.Icon).MaximumLength(100);
            RuleFor(x => x.NameEn).NotEmpty().MaximumLength(255);
            RuleFor(x => x.NameLocal).NotEmpty().MaximumLength(255);
            RuleFor(x => x.RoutePath).MaximumLength(500);
        }
    }

    public sealed class Handler(
        SicDbContext dbContext,
        IMapper mapper,
        IProgramAccessService programAccessService) : IRequestHandler<Command, Guid?>
    {
        public async Task<Guid?> Handle(Command request, CancellationToken cancellationToken)
        {
            var entity = mapper.Map<SuProgram>(request);

            var item = entity.State switch
            {
                EntityState.Added => entity,
                EntityState.Modified => await dbContext.SuPrograms
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
                dbContext.SuPrograms.Add(item);
            }

            await dbContext.SaveChangesAsync(cancellationToken);
            programAccessService.RemoveAllAccessCache();
            return item.Id;
        }
    }
}
