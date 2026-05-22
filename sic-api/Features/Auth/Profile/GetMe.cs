using MediatR;
using Microsoft.EntityFrameworkCore;
using sic_api.Attributes;
using sic_api.Data;
using sic_api.Entities;
using sic_api.Entities.Db;
using sic_api.Entities.Su;
using sic_api.Extensions;
using sic_api.Model;
using sic_api.Model.Storage;
using sic_api.Services.Interfaces;
using System.Security.Claims;

namespace sic_api.Features.Auth.Profile;

public static class GetMe
{
    public class Query : IRequest<Response?>
    {
        
    }

    public class Response : BaseModelState
    {
        public Guid? Id { get; set; }

        public string? TaxId { get; set; }

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
        
        [Storage("UploadGroupData")]
        public Guid? UploadGroupId { get; set; } = null;

        public List<StorageUploadReference> UploadGroupData { get; set; } = [];
 
    }

    public sealed class Handler(SicDbContext dbContext,
        ICurrentUserService currentUserService) : IRequestHandler<Query, Response?>
    {
        public async Task<Response?> Handle(Query request, CancellationToken cancellationToken)
        {
            var sub = currentUserService.GetUserId();

            return await dbContext.SuProfiles
                .Where(x => x.UserId == sub)
                .Select(x => new Response
                {
                    Id = x.Id,
                    TaxId = x.TaxId,
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
                })
                .AsNoTracking()
                .FirstOrDefaultAsync(cancellationToken);
        }
    }
}
