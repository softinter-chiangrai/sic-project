using sic_api.Features.Dynamic;
using sic_api.Model;

namespace sic_api.Services.Interfaces;

public interface IDynamicDataService
{
    Task<PaginationBase<Dictionary<string, object?>>> SearchAsync(
        Guid businessId,
        SearchDynamicData.Query request,
        CancellationToken cancellationToken);

    Task<Dictionary<string, object?>?> GetByIdAsync(
        Guid businessId,
        string programCode,
        Guid id,
        CancellationToken cancellationToken);

    Task<Guid> CreateAsync(
        Guid businessId,
        string programCode,
        Dictionary<string, object?> data,
        CancellationToken cancellationToken);

    Task<Guid?> UpdateAsync(
        Guid businessId,
        string programCode,
        Guid id,
        Dictionary<string, object?> data,
        CancellationToken cancellationToken);

    Task<bool> DeleteAsync(
        Guid businessId,
        string programCode,
        Guid id,
        CancellationToken cancellationToken);
}