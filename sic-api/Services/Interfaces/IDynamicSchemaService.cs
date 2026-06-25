using sic_api.Features.Dynamic;

namespace sic_api.Services.Interfaces;

public interface IDynamicSchemaService
{
    Task<GetDynamicSchema.Response> GetSchemaAsync(
        string programCode,
        CancellationToken cancellationToken);
}