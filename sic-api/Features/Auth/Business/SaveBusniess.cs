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

namespace sic_api.Features.Auth.Business;

public static class SaveBusiness
{
    public class Command : BaseModelState, IRequest<Guid?>, IMapFrom<SuBusiness>
    {

        public Guid? Id { get; set; }

        public string? TaxId { get; set; }

        public string? PersonType { get; set; } = default!;

        public string BusinessCode { get; set; } = default!;

        public string? BranchCode { get; set; }

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

        public string? Fax { get; set; }
        
        public Guid? UploadGroupId { get; set; } = null;

        public List<StorageUploadReference>? UploadGroupData { get; set; }

        public void Mapping(AutoMapper.Profile profile)
        {
            profile.CreateMap<Command, SuBusiness>()
                .ForMember(destination => destination.RowVersion, options => options.Ignore());

        }
    }

    public class Validator : AbstractValidator<Command>
    {
        private readonly SicDbContext _dbContext;

        private readonly ICurrentUserService _currentUserService;

        public Validator(SicDbContext dbContext, ICurrentUserService currentUserService)
        {
            _dbContext = dbContext;
            _currentUserService = currentUserService;

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

            RuleFor(x => x)
                .CustomAsync(ValidateModification);

            RuleFor(x => x.PersonType).NotEmpty();
            RuleFor(x => x.TitleId).NotEmpty();
            RuleFor(x => x.FirstNameEn).NotEmpty();
            RuleFor(x => x.FirstNameLocal).NotEmpty();
            RuleFor(x => x.CountryId).NotEmpty();
            RuleFor(x => x.SupportLocalAddress).NotEmpty();

        }

        private async Task ValidateModification(Command command, ValidationContext<Command> context, CancellationToken cancellationToken)
        {

            var userId = _currentUserService.GetUserId();
            if (userId == null)
            {
                context.AddFailure(nameof(command.Id), "User not found.");
                return;
            }

            if (command.State == EntityState.Modified)
            {
                var hastEdit = await _dbContext.SuUserBusinesses.AsNoTracking()
                    .Where(x => x.BusinessId == command.Id && x.UserId == userId).AnyAsync(cancellationToken);
                if (!hastEdit)
                {
                    context.AddFailure(nameof(command.Id), "User does not have permission to edit this business.");
                }
            }
        }
    }

    public sealed class Handler(
        SicDbContext dbContext,
        IMapper mapper,
        IFileStorageService fileStorageService,
        ICurrentUserService currentUserService,
        IBusinessAccessService businessAccessService) : IRequestHandler<Command, Guid?>
    {
        public async Task<Guid?> Handle(Command request, CancellationToken cancellationToken)
        {
            request.UploadGroupData ??= [];
            request.UploadGroupId = fileStorageService.ResolveUploadGroupId(request.UploadGroupId, request.UploadGroupData);

            SuBusiness? item;

            if (request.State == EntityState.Added)
            {
                item = mapper.Map<SuBusiness>(request);
                item.IsActive = true;
                dbContext.SuBusinesses.Add(item);

                // Create related entities for new business
                var userBusiness = new SuUserBusiness
                {
                    Business = item,
                    UserId = currentUserService.GetUserId(),
                    IsDefault = false,
                    IsActive = true
                };
                dbContext.SuUserBusinesses.Add(userBusiness);

                var businessRole = new SuBusinessRole
                {
                    Business = item,
                    RoleCode = "ADMIN",
                    RoleNameEn = "Administrator",
                    RoleNameLocal = "ผู้ดูแลระบบ",
                    RoleLevel = "1",
                    SortOrder = 1,
                    IsActive = true
                };
                dbContext.SuBusinessRoles.Add(businessRole);

                dbContext.SuUserBusinessRoles.Add(new SuUserBusinessRole
                {
                    UserBusiness = userBusiness,
                    BusinessRole = businessRole,
                    IsPrimary = true,
                    IsActive = true
                });

                await SetMenuBuModule(null,businessRole, cancellationToken);
            }
            else if (request.State == EntityState.Modified)
            {
                item = await dbContext.SuBusinesses
                    .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);

                if (item is null)
                    return null;

                dbContext.Entry(item).Property(x => x.RowVersion).OriginalValue = request.RowVersion!.Value;
                mapper.Map(request, item);
            }
            else
            {
                return null;
            }

            await fileStorageService.SyncUploadsAsync(item.UploadGroupId, request.UploadGroupData, cancellationToken);
            await dbContext.SaveChangesAsync(cancellationToken);

            if (request.State == EntityState.Added)
            {
                await businessAccessService.ChangeBusinessAsync(
                item.Id,
                cancellationToken);
            }

            return item.Id;
        }

        public async Task SetMenuBuModule(Guid? id,SuBusinessRole businessRole, CancellationToken cancellationToken)
        {
            List<SuProgram> childPrograms = await dbContext.SuPrograms.Where(x => x.ParentProgramId == id && x.ProgramCode.StartsWith("BU") && x.IsActive).ToListAsync(cancellationToken);
            foreach (var childProgram in childPrograms)
            {
                var SuBusinessRoleChildProgram = new SuBusinessRoleProgram
                {
                    BusinessRole = businessRole,
                    Program = childProgram,
                    IsActive = true
                };
                dbContext.SuBusinessRolePrograms.Add(SuBusinessRoleChildProgram);
                await SetMenuBuModule(childProgram.Id,businessRole, cancellationToken);
            }
        }
    }
}
