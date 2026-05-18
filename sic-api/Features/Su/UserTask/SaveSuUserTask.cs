using AutoMapper;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using sic_api.Data;
using sic_api.Entities.Su;
using sic_api.Mapping;
using sic_api.Model;

namespace sic_api.Features.Su.UserTask;

public static class SaveSuUserTask
{
    public class Command : BaseModelState, IRequest<Guid?>, IMapFrom<SuUserTask>
    {
        public Guid? Id { get; set; }
        public Guid TaskId { get; set; }
        public string? Title { get; set; }
        public DateTime? StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public string? Description { get; set; }

        public void Mapping(Profile profile)
        {
            profile.CreateMap<Command, SuUserTask>()
                .ForMember(destination => destination.RowVersion, options => options.Ignore())
                .ForMember(destination => destination.Task, options => options.Ignore());
        }
    }

    public class BatchCommand : IRequest<Guid[]?>
    {
        public IReadOnlyCollection<Command> Items { get; set; } = [];
    }

    public class Validator : AbstractValidator<Command>
    {
        public Validator()
        {
            RuleFor(x => x.State)
                .Must(state => state is EntityState.Added or EntityState.Modified or EntityState.Deleted)
                .WithMessage("State must be Added, Modified, or Deleted.");

            RuleFor(x => x.Id)
                .NotEmpty()
                .When(x => x.State is EntityState.Modified or EntityState.Deleted)
                .WithMessage("Id is required when state is Modified or Deleted.");

            RuleFor(x => x.RowVersion)
                .NotNull()
                .When(x => x.State is EntityState.Modified or EntityState.Deleted)
                .WithMessage("RowVersion is required when state is Modified or Deleted.");

            When(x => x.State != EntityState.Deleted, () =>
            {
                RuleFor(x => x.TaskId).NotEmpty();
                RuleFor(x => x.Title).NotEmpty().MaximumLength(100);
                RuleFor(x => x.Description).MaximumLength(2000);
            });
        }
    }

    public class BatchValidator : AbstractValidator<BatchCommand>
    {
        public BatchValidator()
        {
            RuleFor(x => x.Items)
                .NotEmpty()
                .WithMessage("At least one task item is required.");

            RuleForEach(x => x.Items)
                .SetValidator(new Validator());
        }
    }

    public sealed class Handler(SicDbContext dbContext, IMapper mapper) : IRequestHandler<BatchCommand, Guid[]?>
    {
        public async Task<Guid[]?> Handle(BatchCommand request, CancellationToken cancellationToken)
        {
            List<Guid> ids = [];

            foreach (var itemRequest in request.Items)
            {
                if (itemRequest.State == EntityState.Deleted)
                {
                    var item = await dbContext.SuUserTasks
                        .FirstOrDefaultAsync(x => x.Id == itemRequest.Id, cancellationToken)
                        ?? throw new ValidationException($"Delete failed: record not found for Id '{itemRequest.Id}'.");

                    dbContext.Entry(item).Property(x => x.RowVersion).OriginalValue = itemRequest.RowVersion!.Value;
                    dbContext.SuUserTasks.Remove(item);
                    ids.Add(item.Id);
                }
                else if (itemRequest.State == EntityState.Modified)
                {
                    var item = await dbContext.SuUserTasks
                        .FirstOrDefaultAsync(x => x.Id == itemRequest.Id, cancellationToken)
                        ?? throw new ValidationException($"Update failed: record not found for Id '{itemRequest.Id}'.");

                    dbContext.Entry(item).Property(x => x.RowVersion).OriginalValue = itemRequest.RowVersion!.Value;
                    mapper.Map(itemRequest, item);
                    ids.Add(item.Id);
                }
                else if (itemRequest.State == EntityState.Added)
                {
                    var entity = mapper.Map<SuUserTask>(itemRequest);
                    dbContext.SuUserTasks.Add(entity);
                    ids.Add(entity.Id);
                }
            }

            await dbContext.SaveChangesAsync(cancellationToken);
            return ids.ToArray();
        }
    }
}
