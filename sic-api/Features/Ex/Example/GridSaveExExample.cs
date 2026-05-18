using AutoMapper;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using sic_api.Data;
using sic_api.Entities.Ex;
using sic_api.Mapping;
using sic_api.Model;
using sic_api.Model.Storage;
using sic_api.Services.Interfaces;

namespace sic_api.Features.Ex.Example;

public static class GridSaveExExample
{
    public class Command : BaseModelState, IRequest<Guid?>, IMapFrom<ExExample>
    {
        public Guid? Id { get; set; }
        public string ExampleCode { get; set; } = default!;

        public string MessageEn { get; set; } = default!;

        public string MessageLocal { get; set; } = default!;

        public DateTime StartDate { get; set; } = default!;

        public DateTime EndDate { get; set; } = default!;

        public string StartTime { get; set; } = default!;

        public string EndTime { get; set; } = default!;

        public string IsAccept { get; set; } = default!;

        public string Color { get; set; } = default!;

        public string CountryCode { get; set; } = default!;

        public long Total { get; set; } = default!;

        public bool IsActive { get; set; } = true;

        public List<StorageUploadReference> UploadGroupData { get; set; } = [];

        public void Mapping(Profile profile)
        {
            profile.CreateMap<Command, ExExample>()
                .ForMember(destination => destination.RowVersion, options => options.Ignore())
                .ForMember(destination => destination.UploadGroupData, options => options.Ignore());
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
                RuleFor(x => x.ExampleCode).NotEmpty().MaximumLength(50);
                RuleFor(x => x.MessageEn).NotEmpty();
                RuleFor(x => x.MessageLocal).NotEmpty();
                RuleFor(x => x.StartDate).NotEmpty();
                RuleFor(x => x.EndDate).NotEmpty();
                RuleFor(x => x.StartTime).NotEmpty();
                RuleFor(x => x.EndTime).NotEmpty();
                RuleFor(x => x.IsAccept).NotEmpty();
                RuleFor(x => x.Color).NotEmpty();
                // RuleFor(x => x.CountryCode).NotEmpty();
                RuleFor(x => x.Total).NotEmpty();
            });
        }
    }

    public class BatchValidator : AbstractValidator<BatchCommand>
    {
        public BatchValidator()
        {
            RuleFor(x => x.Items)
                .NotEmpty()
                .WithMessage("At least one grid item is required.");

            RuleForEach(x => x.Items)
                .SetValidator(new Validator());
        }
    }

    public sealed class Handler(SicDbContext dbContext, IMapper mapper, IFileStorageService fileStorageService) : IRequestHandler<BatchCommand, Guid[]?>
    {
        public async Task<Guid[]?> Handle(BatchCommand request, CancellationToken cancellationToken)
        {
            List<Guid> ids = [];

            foreach (var itemRequest in request.Items)
            {
                if (itemRequest.State == EntityState.Deleted)
                {
                    var item = await dbContext.ExExamples
                        .FirstOrDefaultAsync(x => x.Id == itemRequest.Id, cancellationToken)
                        ?? throw new ValidationException($"Delete failed: record not found for Id '{itemRequest.Id}'.");

                    dbContext.Entry(item).Property(x => x.RowVersion).OriginalValue = itemRequest.RowVersion!.Value;
                    await fileStorageService.DeleteUploadsAsync(item.UploadGroupId, itemRequest.UploadGroupData, cancellationToken);
                    dbContext.ExExamples.Remove(item);
                    ids.Add(item.Id);
                }
                else if (itemRequest.State == EntityState.Modified)
                {
                    var item = await dbContext.ExExamples
                        .FirstOrDefaultAsync(x => x.Id == itemRequest.Id, cancellationToken)
                        ?? throw new ValidationException($"Update failed: record not found for Id '{itemRequest.Id}'.");

                    dbContext.Entry(item).Property(x => x.RowVersion).OriginalValue = itemRequest.RowVersion!.Value;
                    mapper.Map(itemRequest, item);
                    item.UploadGroupId = fileStorageService.ResolveUploadGroupId(item.UploadGroupId, itemRequest.UploadGroupData);

                    await fileStorageService.SyncUploadsAsync(item.UploadGroupId, itemRequest.UploadGroupData, cancellationToken);
                    ids.Add(item.Id);
                }
                else if (itemRequest.State == EntityState.Added)
                {
                    var entity = mapper.Map<ExExample>(itemRequest);
                    entity.UploadGroupId = fileStorageService.ResolveUploadGroupId(entity.UploadGroupId, itemRequest.UploadGroupData);

                    dbContext.ExExamples.Add(entity);
                    await fileStorageService.SyncUploadsAsync(entity.UploadGroupId, itemRequest.UploadGroupData, cancellationToken);
                    ids.Add(entity.Id);
                }
            }

            await dbContext.SaveChangesAsync(cancellationToken);
            return ids.ToArray();
        }
    }
}
