using MediatR;
using Microsoft.EntityFrameworkCore;
using sic_api.Attributes;
using sic_api.Data;
using sic_api.Model;
using sic_api.Model.Storage;
using sic_api.Services.Interfaces;

namespace sic_api.Features.Bu.Rt.Budt01;

public static class GetBusinessInfo
{
    public class Query : IRequest<Response?>
    {
    }

    public class Response : BaseModelState
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
    }

    public sealed class Handler( SicDbContext dbContext, IBusinessAccessService businessAccessService)
        : IRequestHandler<Query, Response?>
    {
        public async Task<Response?> Handle(Query request, CancellationToken cancellationToken)
        {
            var businessId = businessAccessService.GetBusinessId();

            return await dbContext.SuBusinesses
                .Where(x => x.Id == businessId)
                .Select(x => new Response
                {
                    Id = x.Id,
                    TaxId = x.TaxId,
                    BusinessCode = x.BusinessCode,
                    BranchCode = x.BranchCode,
                    PersonType = x.PersonType,
                    TitleId = x.TitleId,
                    FirstNameEn = x.FirstNameEn,
                    MiddleNameEn = x.MiddleNameEn,
                    LastNameEn = x.LastNameEn,
                    FirstNameLocal = x.FirstNameLocal,
                    MiddleNameLocal = x.MiddleNameLocal,
                    LastNameLocal = x.LastNameLocal,
                    CountryId = x.CountryId,
                    SupportLocalAddress = x.SupportLocalAddress,
                    AddressEn = x.AddressEn,
                    AddressLocal = x.AddressLocal,
                    ProvinceId = x.ProvinceId,
                    DistrictId = x.DistrictId,
                    SubDistrictId = x.SubDistrictId,
                    ZipCode = x.ZipCode,
                    Email = x.Email,
                    PhoneNumber = x.PhoneNumber,
                    UploadGroupId = x.UploadGroupId,
                    RowVersion = x.RowVersion
                }).FirstOrDefaultAsync(cancellationToken);
        }
    }
}
