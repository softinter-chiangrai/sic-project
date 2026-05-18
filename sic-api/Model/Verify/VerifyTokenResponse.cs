namespace sic_api.Model.Verify;

public class VerifyTokenResponse
{
    public Guid Id { get; set; }

    public string VerifyType { get; set; } = default!;

    public string ReferenceNumber { get; set; } = default!;

    public string Token { get; set; } = default!;

    public int RetryCount { get; set; }

    public int MaxRetry { get; set; }

    public DateTime? ExpireAt { get; set; }

    public bool IsExpired { get; set; }

    public bool IsExhausted { get; set; }
}

public class VerifyCheckResponse
{
    public bool IsValid { get; set; }

    public string Message { get; set; } = default!;

    public int RetryCount { get; set; }

    public int MaxRetry { get; set; }

    public int RemainingAttempts { get; set; }
}
