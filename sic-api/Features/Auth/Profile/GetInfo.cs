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
using sic_api.Utility;
using System.Security.Claims;

namespace sic_api.Features.Auth.Profile;

public static class GetInfo
{
    public class Query : IRequest<Response?>
    {
        
    }

    public class Response
    {
        public Guid Id { get; set; }

        public string Name { get; set; } = default!;
        
        [Storage("UploadGroupData")]
        public Guid? UploadGroupId { get; set; } = null;

        public List<StorageUploadReference> UploadGroupData { get; set; } = [];
 
    }

    public sealed class Handler(SicDbContext dbContext,
        ICurrentUserService currentUserService,
        IRequestLanguageProvider requestLanguageProvider) : IRequestHandler<Query, Response?>
    {
        public async Task<Response?> Handle(Query request, CancellationToken cancellationToken)
        {
            var useEnglish = requestLanguageProvider.UseEnglish();

            return await dbContext.SuProfiles
                .Include(x => x.Title)
                .AsNoTracking()
                .Where(x => x.UserId == currentUserService.GetUserId())
                .Select(x => new Response
                {
                    Id = x.Id,
                    Name = useEnglish ? NameUtility.JoinNames(new[] { x.Title.PrefixNameEn, x.FirstNameEn, x.MiddleNameEn, x.LastNameEn, x.Title.SuffixNameEn }) 
                        : NameUtility.JoinNames(new[] { x.Title.PrefixNameLocal, x.FirstNameLocal, x.MiddleNameLocal, x.LastNameLocal, x.Title.SuffixNameLocal }),
                    UploadGroupId = x.UploadGroupId,
                })
                .AsNoTracking()
                .FirstOrDefaultAsync(cancellationToken);
        }
    }
}
