using sic_api.Model.Auth;
using sic_api.Model.Business;

namespace sic_api.Services.Interfaces;

public interface IBusinessAccessService
{
    Task<List<BusinessDto>> GetMyBusinessesAsync(CancellationToken cancellationToken = default);
    Task<bool> CanAccessBusinessAsync(Guid businessId, CancellationToken cancellationToken = default);
    Task<ChangeBusinessResponse> ChangeBusinessAsync(Guid businessId, string? clientIp, CancellationToken cancellationToken = default);
    Guid GetBusinessId();
}
