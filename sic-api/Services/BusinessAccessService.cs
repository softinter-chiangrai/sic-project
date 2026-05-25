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
    /// <summary>
    /// Returns the server-resolved active BusinessId from HttpContext.Items.
    /// This value is set exclusively by BusinessContextMiddleware after querying the database,
    /// so it is tamper-proof and cannot be influenced by the client.
    /// </summary>
    public Guid GetBusinessId()
    {
        return httpContextAccessor.HttpContext?.Items[BusinessContextKeys.ActiveBusinessId] is Guid id
            ? id
            : Guid.Empty;
    }
    
    public async Task<List<BusinessDto>> GetMyBusinessesAsync(CancellationToken cancellationToken = default)
    {
        var userId = currentUserService.GetUserId();

        var useEnglish = requestLanguageProvider.UseEnglish();

        return await dbContext.SuUserBusinesses
            .Include(x => x.Business)
            .ThenInclude(x => x.Title)
            .AsNoTracking()
            .Where(x => x.UserId == userId && x.IsActive && x.Business.IsActive)
            .Select(x => new BusinessDto
            {
                Id = x.Business.Id,
                Name = useEnglish ? NameUtility.JoinNames(new[] { x.Business.Title.PrefixNameEn, x.Business.FirstNameEn, x.Business.MiddleNameEn, x.Business.LastNameEn, x.Business.Title.SuffixNameEn }) 
                    : NameUtility.JoinNames(new[] { x.Business.Title.PrefixNameLocal, x.Business.FirstNameLocal, x.Business.MiddleNameLocal, x.Business.LastNameLocal, x.Business.Title.SuffixNameLocal }),
                IsDefault = x.IsDefault
            })
            .OrderByDescending(x => x.IsDefault)
            .ThenBy(x => x.Id)
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> CanAccessBusinessAsync(Guid businessId, CancellationToken cancellationToken = default)
    {
        var userId = currentUserService.GetUserId();

        return await dbContext.SuUserBusinesses
            .AsNoTracking()
            .AnyAsync(x =>
                x.UserId == userId &&
                x.IsActive &&
                x.Business.IsActive &&
                x.Business.Id == businessId,
                cancellationToken);
    }

    public async Task<ChangeBusinessResponse> ChangeBusinessAsync(Guid businessId, CancellationToken cancellationToken = default)
    {
        var userId = currentUserService.GetUserId();
        var username = currentUserService.GetUsername();
        var sessionId = currentUserService.GetSessionId();
        var clientIp = currentUserService.GetIpAddress();
        
        var userBusiness = await dbContext.SuUserBusinesses
            .Include(x => x.Business)
            .ThenInclude(x => x.Title)
            .Where(x => x.UserId == userId && x.BusinessId == businessId && x.IsActive && x.Business.IsActive)
            .FirstOrDefaultAsync(cancellationToken);

        if (userBusiness is null)
        {
            throw new UnauthorizedAccessException($"User has no access to business_id '{businessId}'.");
        }

        // Update IsDefault: set the target business to true, all others for this user to false.
        // This is what BusinessContextMiddleware reads to resolve the active business context.
        await dbContext.SuUserBusinesses
            .Where(x => x.UserId == userId && x.IsActive)
            .ExecuteUpdateAsync(
                x => x.SetProperty(ub => ub.IsDefault, ub => ub.BusinessId == businessId),
                cancellationToken);

        List<SuBusinessAudit> ActiveList = await dbContext.SuBusinessAudits
            .Where(x => x.UserId == userId && x.SessionId == sessionId && x.IsActive)
            .ToListAsync(cancellationToken);

        foreach (var item in ActiveList)
        {
            item.IsActive = false;
        }

        dbContext.SuBusinessAudits.UpdateRange(ActiveList); 

        dbContext.SuBusinessAudits.Add(new SuBusinessAudit
        {
            UserId = userBusiness.UserId,
            SessionId = sessionId,
            Username = username,
            BusinessId = userBusiness.Business.Id,
            ClientIp = clientIp,
            IsActive = true,
            Remark = "User changed active business from API."
        });

        await dbContext.SaveChangesAsync(cancellationToken);

        var useEnglish = requestLanguageProvider.UseEnglish();

        return new ChangeBusinessResponse
        {
            UserId = userId,
            Username = username,
            BusinessId = userBusiness.Business.Id,
            BusinessName = useEnglish ? NameUtility.JoinNames(new[] { userBusiness.Business.Title.PrefixNameEn, userBusiness.Business.FirstNameEn, userBusiness.Business.MiddleNameEn, userBusiness.Business.LastNameEn, userBusiness.Business.Title.SuffixNameEn }) 
                : NameUtility.JoinNames(new[] { userBusiness.Business.Title.PrefixNameLocal, userBusiness.Business.FirstNameLocal, userBusiness.Business.MiddleNameLocal, userBusiness.Business.LastNameLocal, userBusiness.Business.Title.SuffixNameLocal }),
            Changed = true
        };
    }

    public Task<BusinessDto?> GetBusinessAsync(Guid businessId, CancellationToken cancellationToken = default)
    {
        var useEnglish = requestLanguageProvider.UseEnglish();

        return dbContext.SuBusinesses
            .Include(x => x.Title)
            .AsNoTracking()
            .Where(x => x.Id == businessId && x.IsActive)
            .Select(x => new BusinessDto
            {
                Id = x.Id,
                Code = x.BusinessCode,
                Name = useEnglish ? NameUtility.JoinNames(new[] { x.Title.PrefixNameEn, x.FirstNameEn, x.MiddleNameEn, x.LastNameEn, x.Title.SuffixNameEn }) 
                    : NameUtility.JoinNames(new[] { x.Title.PrefixNameLocal, x.FirstNameLocal, x.MiddleNameLocal, x.LastNameLocal, x.Title.SuffixNameLocal }),
                UploadGroupId = x.UploadGroupId
            })
            .FirstOrDefaultAsync(cancellationToken);
    }
    public async Task<bool> GetBusinessActivationAsync(CancellationToken cancellationToken = default)
    {
        // If business is already active in this request, return it immediately.
        // var currentId = GetBusinessId();
        // if (currentId != Guid.Empty)
        //     return false;

        // Read session identifier and client IP from the HTTP context.
        var sessionId = currentUserService.GetSessionId();
        var clientIp = currentUserService.GetIpAddress();

        var userId = currentUserService.GetUserId();

        // Fetch only the IDs of businesses this user can access.
        var userBusinessIds = await dbContext.SuUserBusinesses
            .AsNoTracking()
            .Where(x => x.UserId == userId && x.IsActive)
            .Select(x => x.BusinessId)
            .ToListAsync(cancellationToken);

        if (userBusinessIds.Count == 0) return false;

        // Prefer the business most recently used within this browser session.
        var businessToActivate = await dbContext.SuBusinessAudits
            .AsNoTracking()
            .Where(x => x.SessionId == sessionId && x.UserId == userId && x.ClientIp == clientIp && userBusinessIds.Contains(x.BusinessId))
            .OrderByDescending(x => x.Id)
            .Select(x => (Guid?)x.BusinessId)
            .FirstOrDefaultAsync(cancellationToken);

        // Fall back to the most recently used business overall for this user.
        businessToActivate ??= await dbContext.SuBusinessAudits
            .AsNoTracking()
            .Where(x => x.UserId == userId && userBusinessIds.Contains(x.BusinessId))
            .OrderByDescending(x => x.Id)
            .Select(x => (Guid?)x.BusinessId)
            .FirstOrDefaultAsync(cancellationToken);

        // Final fallback: just pick the first available business.
        await ChangeBusinessAsync(businessToActivate ?? userBusinessIds[0], cancellationToken);
        return true;
    }
}
