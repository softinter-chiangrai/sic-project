using Microsoft.EntityFrameworkCore;
using sic_api.Data;
using sic_api.Entities.Su;
using sic_api.Model.Auth;
using sic_api.Model.Business;
using sic_api.Services.Interfaces;
using sic_api.Utility;

namespace sic_api.Services;

public class BusinessAccessService(
    SicDbContext dbContext,
    ICurrentUserService currentUserService,
    IHttpContextAccessor httpContextAccessor,
    IRequestLanguageProvider requestLanguageProvider) : IBusinessAccessService
{

    public const string BusinessIdHeaderName = "X-Business-Id";

    public Guid GetBusinessId()
    {
        var businessIdString = httpContextAccessor.HttpContext?.Request.Headers[BusinessIdHeaderName].ToString();
        return Guid.TryParse(businessIdString, out var businessId) ? businessId : Guid.Empty;
    }
    
    public async Task<List<BusinessDto>> GetMyBusinessesAsync(CancellationToken cancellationToken = default)
    {
        var userId = currentUserService.GetUserId();

        var useEnglish = requestLanguageProvider.UseEnglish();

        return await dbContext.SuUserBusinesses
            .Include(x => x.Business)
            .ThenInclude(x => x.Title)
            .AsNoTracking()
            .Where(x => x.KeycloakUserId == userId && x.IsActive && x.Business.IsActive)
            .Select(x => new BusinessDto
            {
                BusinessId = x.Business.Id,
                BusinessName = useEnglish ? NameUtility.JoinNames(new[] { x.Business.Title.PrefixNameEn, x.Business.FirstNameEn, x.Business.MiddleNameEn, x.Business.LastNameEn, x.Business.Title.SuffixNameEn }) 
                    : NameUtility.JoinNames(new[] { x.Business.Title.PrefixNameLocal, x.Business.FirstNameLocal, x.Business.MiddleNameLocal, x.Business.LastNameLocal, x.Business.Title.SuffixNameLocal }),
                IsDefault = x.IsDefault
            })
            .OrderByDescending(x => x.IsDefault)
            .ThenBy(x => x.BusinessId)
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> CanAccessBusinessAsync(Guid businessId, CancellationToken cancellationToken = default)
    {
        var userId = currentUserService.GetUserId();

        return await dbContext.SuUserBusinesses
            .AsNoTracking()
            .AnyAsync(x =>
                x.KeycloakUserId == userId &&
                x.IsActive &&
                x.Business.IsActive &&
                x.Business.Id == businessId,
                cancellationToken);
    }

    public async Task<ChangeBusinessResponse> ChangeBusinessAsync(Guid businessId, string? clientIp, CancellationToken cancellationToken = default)
    {
        var userId = currentUserService.GetUserId();
        var username = currentUserService.GetUsername();

        var userBusinesses = await dbContext.SuUserBusinesses
            .Include(x => x.Business)
            .Where(x => x.KeycloakUserId == userId && x.IsActive && x.Business.IsActive)
            .ToListAsync(cancellationToken);

        var target = userBusinesses.FirstOrDefault(x => x.Business.Id == businessId);
        if (target is null)
        {
            throw new UnauthorizedAccessException($"User has no access to business_id '{businessId}'.");
        }

        foreach (var item in userBusinesses)
        {
            item.IsDefault = item.Business.Id == businessId;
            item.UpdatedBy = username ?? userId;
        }

        dbContext.SuBusinessAudits.Add(new SuBusinessAudit
        {
            KeycloakUserId = userId,
            Username = username,
            BusinessId = target.Business.Id,
            ClientIp = clientIp,
            Remark = "User changed active business from API.",
            CreatedBy = username ?? userId,
            UpdatedBy = username ?? userId
        });

        await dbContext.SaveChangesAsync(cancellationToken);

        var useEnglish = requestLanguageProvider.UseEnglish();

        return new ChangeBusinessResponse
        {
            KeycloakUserId = userId,
            Username = username,
            BusinessId = target.Business.Id,
            BusinessName = useEnglish ? NameUtility.JoinNames(new[] { target.Business.Title.PrefixNameEn, target.Business.FirstNameEn, target.Business.MiddleNameEn, target.Business.LastNameEn, target.Business.Title.SuffixNameEn }) 
                : NameUtility.JoinNames(new[] { target.Business.Title.PrefixNameLocal, target.Business.FirstNameLocal, target.Business.MiddleNameLocal, target.Business.LastNameLocal, target.Business.Title.SuffixNameLocal }),
            Changed = true
        };
    }
}
