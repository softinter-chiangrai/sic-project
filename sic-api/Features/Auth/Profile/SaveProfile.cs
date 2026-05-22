using AutoMapper;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using sic_api.Data;
using sic_api.Entities.Su;
using sic_api.Mapping;
using sic_api.Model;
using sic_api.Model.Storage;
using sic_api.Model.Verify;
using sic_api.Services.Interfaces;

namespace sic_api.Features.Auth.Profile;

public static class SaveProfile
{
    public class Command : BaseModelState, IRequest<Guid?>, IMapFrom<SuProfile>
    {

        public Guid? Id { get; set; }

        public string? TaxId { get; set; }
        public string? BranchCode { get; set; }

        public string? BusinessCode { get; set; }

        public Guid? TitleId { get; set; }

        public string? FirstNameEn { get; set; }

        public string? MiddleNameEn { get; set; }

        public string? LastNameEn { get; set; }

        public string? FirstNameLocal { get; set; }

        public string? MiddleNameLocal { get; set; }

        public string? LastNameLocal { get; set; }

        public Guid? CountryId { get; set; }

        public bool? SupportLocalAddress { get; set; }
        
        public string? AddressEn { get; set; }

        public string? AddressLocal { get; set; }

        public Guid? ProvinceId { get; set; }

        public Guid? DistrictId { get; set; }

        public Guid? SubDistrictId { get; set; }

        public string? ZipCode { get; set; }

        public string? Email { get; set; }

        public string? PhoneNumber { get; set; }
        
        public Guid? UploadGroupId { get; set; } = null;

        public List<StorageUploadReference>? UploadGroupData { get; set; }

        public string? ReferenceNumber { get; set; }
        public string? VerifyToken { get; set; }

        public void Mapping(AutoMapper.Profile profile)
        {
            profile.CreateMap<Command, SuProfile>()
                .ForMember(destination => destination.RowVersion, options => options.Ignore());

        }
    }

    public class Validator : AbstractValidator<Command>
    {
        private readonly SicDbContext _dbContext;
        private readonly IVerifyService _verifyService;

        public Validator(SicDbContext dbContext, IVerifyService verifyService)
        {
            _dbContext = dbContext;
            _verifyService = verifyService;

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

            RuleFor(x => x.TitleId).NotEmpty();
            RuleFor(x => x.LastNameEn).NotEmpty();
            RuleFor(x => x.FirstNameLocal).NotEmpty();
            RuleFor(x => x.Email).NotEmpty();

            RuleFor(x => x)
                .CustomAsync(ValidateEmailModification);
        }

        private async Task ValidateEmailModification(Command command, ValidationContext<Command> context, CancellationToken cancellationToken)
        {
            bool isAdded = command.State == EntityState.Added;
            bool isModified = command.State == EntityState.Modified;

            if (!isAdded && !isModified) return;

            if (isModified)
            {
                var profile = await _dbContext.SuProfiles
                    .AsNoTracking()
                    .FirstAsync(x => x.Id == command.Id, cancellationToken);

                bool isEmailUnchanged = string.Equals(profile.Email, command.Email, StringComparison.OrdinalIgnoreCase);
                if (isEmailUnchanged) return;
            }

            // Common Token Validation Strategy
            if (string.IsNullOrEmpty(command.ReferenceNumber) || string.IsNullOrEmpty(command.VerifyToken))
            {
                context.AddFailure(nameof(command.ReferenceNumber), "ReferenceNumber and VerifyToken are required for email verification.");
                return;
            }

            var verifyCheck = await _verifyService.VerifyTokenAsync("Email", command.ReferenceNumber, command.VerifyToken);
            if (!verifyCheck.IsValid)
            {
                context.AddFailure(nameof(command.ReferenceNumber), "Email verification failed. Invalid token or reference number.");
            }
        }
    }

    public sealed class Handler(
        SicDbContext dbContext,
        IMapper mapper,
        IFileStorageService fileStorageService,
        ICurrentUserService currentUserService) : IRequestHandler<Command, Guid?>
    {
        public async Task<Guid?> Handle(Command request, CancellationToken cancellationToken)
        {
            request.UploadGroupData ??= [];
            request.UploadGroupId = fileStorageService.ResolveUploadGroupId(request.UploadGroupId, request.UploadGroupData);

            var entity = mapper.Map<SuProfile>(request);
            entity.UserId = currentUserService.GetUserId();

            var item = entity.State switch
            {
                EntityState.Added => entity,
                EntityState.Modified => await dbContext.SuProfiles
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
                dbContext.SuProfiles.Add(item);
            }

            await fileStorageService.SyncUploadsAsync(item.UploadGroupId, request.UploadGroupData, cancellationToken);

            await dbContext.SaveChangesAsync(cancellationToken);
            return item.Id;
        }
    }
}
