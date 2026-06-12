using AutoMapper;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using sic_api.Attributes;
using sic_api.Data;
using sic_api.Entities.Su;
using sic_api.Mapping;
using sic_api.Model;
using sic_api.Model.Storage;
using sic_api.Services.Interfaces;

namespace sic_api.Features.Bu.Rt.Budt01;

public static class SaveBusinessInfo
{
    public class Command : BaseModelState, IRequest<Guid?>, IMapFrom<SuBusiness>
    {

        public Guid Id { get; set; }
        public string? TaxId { get; set; }
        public string BusinessCode { get; set; } = default!;
        public string? BranchCode { get; set; }
        public string PersonType { get; set; } = default!;
        public Guid TitleId { get; set; }
        public string FirstNameEn { get; set; } = default!;
        public string? MiddleNameEn { get; set; }
        public string? LastNameEn { get; set; }
        public string FirstNameLocal { get; set; } = default!;
        public string? MiddleNameLocal { get; set; }
        public string? LastNameLocal { get; set; }
        public Guid CountryId { get; set; }
        public bool SupportLocalAddress { get; set; } = false;
        public string? AddressEn { get; set; }
        public string? AddressLocal { get; set; }
        public Guid? ProvinceId { get; set; }
        public Guid? DistrictId { get; set; }
        public Guid? SubDistrictId { get; set; }
        public string? ZipCode { get; set; }
        public string? Email { get; set; }
        public string? PhoneNumber { get; set; }
        [Storage("UploadGroupData")]
        public Guid? UploadGroupId { get; set; } = null;

        public List<StorageUploadReference> UploadGroupData { get; set; } = [];

        public void Mapping(Profile profile)
        {
            profile.CreateMap<Command, SuBusiness>()
                .ForMember(destination => destination.RowVersion, options => options.Ignore());

        }
    }

    public class Validator : AbstractValidator<Command>
    {
        public Validator()
        {
            RuleFor(x => x.State)
                .Must(state => state is not EntityState.Modified)
                .WithMessage("State must be modified only.");

            RuleFor(x => x.Id)
                .NotEmpty()
                .When(x => x.State == EntityState.Modified)
                .WithMessage("Id is required when state is Modified.");

            RuleFor(x => x.RowVersion)
                .NotNull()
                .When(x => x.State == EntityState.Modified)
                .WithMessage("RowVersion is required when state is Modified.");
        }
    }

    public sealed class Handler(
        SicDbContext dbContext,
        IMapper mapper,
        IFileStorageService fileStorageService,
        IBusinessAccessService businessAccessService) : IRequestHandler<Command, Guid?>
    {
        public async Task<Guid?> Handle(Command request, CancellationToken cancellationToken)
        {
            request.UploadGroupData ??= [];
            request.UploadGroupId = fileStorageService.ResolveUploadGroupId(request.UploadGroupId, request.UploadGroupData);

            var entity = mapper.Map<SuBusiness>(request);

            var businessId = businessAccessService.GetBusinessId();

            var item = entity.State switch
            {
                EntityState.Modified => await dbContext.SuBusinesses
                    .FirstOrDefaultAsync(x => x.Id == entity.Id && x.Id == businessId, cancellationToken),
                _ => null
            };

            if (item is null)
            {
                return null;
            }

            dbContext.Entry(item).Property(x => x.RowVersion).OriginalValue = request.RowVersion!.Value;
            mapper.Map(request, item);

            await fileStorageService.SyncUploadsAsync(item.UploadGroupId, request.UploadGroupData, cancellationToken);

            await dbContext.SaveChangesAsync(cancellationToken);
            return item.Id;
        }
    }
}
