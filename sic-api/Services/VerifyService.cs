using Microsoft.EntityFrameworkCore;
using sic_api.Data;
using sic_api.Entities.Su;
using sic_api.Model.Verify;
using sic_api.Services.Interfaces;
using System.Security.Cryptography;

namespace sic_api.Services;

public class VerifyService : IVerifyService
{
    private readonly SicDbContext _context;
    private readonly ILogger<VerifyService> _logger;

    public VerifyService(SicDbContext context, ILogger<VerifyService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<VerifyTokenResponse> GenerateTokenAsync(GenerateVerifyTokenRequest request)
    {
        // Check if a valid token already exists for this reference
        var existingToken = await _context.Set<SuVerify>()
            .FirstOrDefaultAsync(v =>
                v.VerifyType == request.VerifyType &&
                v.ReferenceNumber == request.ReferenceNumber &&
                v.ExpireAt > DateTime.UtcNow &&
                !v.IsDelete);

        if (existingToken != null)
        {
            _logger.LogInformation("Valid token already exists for {VerifyType}: {ReferenceNumber}", request.VerifyType, request.ReferenceNumber);
            return MapToResponse(existingToken);
        }

        // Generate a secure random token
        var token = GenerateSecureToken();
        var expireAt = DateTime.UtcNow.AddMinutes(request.ExpirationMinutes);

        var verify = new SuVerify
        {
            Id = Guid.CreateVersion7(),
            VerifyType = request.VerifyType,
            ReferenceNumber = request.ReferenceNumber,
            Token = token,
            MaxRetry = request.MaxRetry,
            RetryCount = 0,
            ExpireAt = expireAt,
            Recipient = request.Recipient,
        };

        _context.Set<SuVerify>().Add(verify);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Verification token generated for {VerifyType}: {ReferenceNumber}", request.VerifyType, request.ReferenceNumber);

        return MapToResponse(verify);
    }

    public async Task<VerifyCheckResponse> VerifyTokenAsync(string verifyType, string referenceNumber, string token)
    {
        var verify = await _context.Set<SuVerify>()
            .FirstOrDefaultAsync(v =>
                v.VerifyType == verifyType &&
                v.ReferenceNumber == referenceNumber &&
                !v.IsDelete);

        if (verify == null)
        {
            _logger.LogWarning("Verification record not found for {VerifyType}: {ReferenceNumber}", verifyType, referenceNumber);
            return new VerifyCheckResponse
            {
                IsValid = false,
                Message = "Verification record not found",
                RetryCount = 0,
                MaxRetry = 0,
                RemainingAttempts = 0
            };
        }

        // Check if token is expired
        if (verify.ExpireAt < DateTime.UtcNow)
        {
            _logger.LogWarning("Verification token expired for {VerifyType}: {ReferenceNumber}", verifyType, referenceNumber);
            return new VerifyCheckResponse
            {
                IsValid = false,
                Message = "Verification token has expired",
                RetryCount = verify.RetryCount,
                MaxRetry = verify.MaxRetry,
                RemainingAttempts = Math.Max(0, verify.MaxRetry - verify.RetryCount)
            };
        }

        // Check if max retries exceeded
        if (verify.RetryCount >= verify.MaxRetry)
        {
            _logger.LogWarning("Max retry attempts exceeded for {VerifyType}: {ReferenceNumber}", verifyType, referenceNumber);
            return new VerifyCheckResponse
            {
                IsValid = false,
                Message = "Maximum verification attempts exceeded",
                RetryCount = verify.RetryCount,
                MaxRetry = verify.MaxRetry,
                RemainingAttempts = 0
            };
        }

        // Increment retry count
        verify.RetryCount++;

        // Constant-time comparison to prevent timing attacks.
        // Plain string equality leaks information about how many characters match.
        bool isValid = !string.IsNullOrEmpty(verify.Token) &&
            CryptographicOperations.FixedTimeEquals(
                System.Text.Encoding.UTF8.GetBytes(verify.Token),
                System.Text.Encoding.UTF8.GetBytes(token ?? string.Empty));

        if (isValid)
        {
            _logger.LogInformation("Verification token verified successfully for {VerifyType}: {ReferenceNumber}", verifyType, referenceNumber);
            _context.SuVerifies.Remove(verify);
        }
        else
        {
            _logger.LogWarning("Invalid verification token for {VerifyType}: {ReferenceNumber} (Attempt {RetryCount}/{MaxRetry})", verifyType, referenceNumber, verify.RetryCount, verify.MaxRetry);
        }

        await _context.SaveChangesAsync();

        return new VerifyCheckResponse
        {
            IsValid = isValid,
            Message = isValid
                ? "Verification successful"
                : $"Invalid token. Remaining attempts: {Math.Max(0, verify.MaxRetry - verify.RetryCount)}",
            RetryCount = verify.RetryCount,
            MaxRetry = verify.MaxRetry,
            RemainingAttempts = Math.Max(0, verify.MaxRetry - verify.RetryCount)
        };
    }

    public async Task<SuVerify?> GetTokenAsync(Guid id)
    {
        return await _context.Set<SuVerify>()
            .FirstOrDefaultAsync(v => v.Id == id && !v.IsDelete);
    }

    public async Task<int> CleanupExpiredTokensAsync()
    {
        var expiredTokens = await _context.Set<SuVerify>()
            .Where(v => v.ExpireAt < DateTime.UtcNow && !v.IsDelete)
            .ToListAsync();

        foreach (var token in expiredTokens)
        {
            token.IsDelete = true;
            token.DeleteBy = "system";
            token.DeleteDate = DateTime.UtcNow;
            token.UpdatedBy = "system";
            token.UpdatedDate = DateTime.UtcNow;
        }

        if (expiredTokens.Any())
        {
            await _context.SaveChangesAsync();
            _logger.LogInformation("Cleaned up {ExpiredTokensCount} expired verification tokens", expiredTokens.Count);
        }

        return expiredTokens.Count;
    }

    private static string GenerateSecureToken(int length = 32)
    {
        var randomBytes = new byte[length];
        using (var rng = RandomNumberGenerator.Create())
        {
            rng.GetBytes(randomBytes);
        }
        return Convert.ToBase64String(randomBytes).Replace("+", "-").Replace("/", "_").TrimEnd('=');
    }

    private static VerifyTokenResponse MapToResponse(SuVerify verify)
    {
        return new VerifyTokenResponse
        {
            Id = verify.Id,
            VerifyType = verify.VerifyType,
            ReferenceNumber = verify.ReferenceNumber,
            Token = verify.Token,
            RetryCount = verify.RetryCount,
            MaxRetry = verify.MaxRetry,
            ExpireAt = verify.ExpireAt,
            IsExpired = verify.ExpireAt < DateTime.UtcNow,
            IsExhausted = verify.RetryCount >= verify.MaxRetry
        };
    }
}
