using sic_api.Entities.Su;
using sic_api.Model.Verify;

namespace sic_api.Services.Interfaces;

public interface IVerifyService
{
    /// <summary>
    /// Generate a new verification token
    /// </summary>
    Task<VerifyTokenResponse> GenerateTokenAsync(GenerateVerifyTokenRequest request);

    /// <summary>
    /// Verify a token and mark as used
    /// </summary>
    Task<VerifyCheckResponse> VerifyTokenAsync(string verifyType, string referenceNumber, string token);

    /// <summary>
    /// Get verification token by ID
    /// </summary>
    Task<SuVerify?> GetTokenAsync(Guid id);

    /// <summary>
    /// Delete expired tokens (cleanup)
    /// </summary>
    Task<int> CleanupExpiredTokensAsync();
}
