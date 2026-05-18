using System.ComponentModel.DataAnnotations;

namespace sic_api.Model.Verify;

public class GenerateVerifyTokenRequest
{
    /// <summary>
    /// Type of verification (e.g., EMAIL_CONFIRMATION, PASSWORD_RESET, PHONE_VERIFICATION)
    /// </summary>
    [Required]
    [MaxLength(100)]
    public string VerifyType { get; set; } = default!;

    /// <summary>
    /// Reference number (e.g., email address, user ID, phone number)
    /// </summary>
    [Required]
    [MaxLength(300)]
    public string ReferenceNumber { get; set; } = default!;

    /// <summary>
    /// Token expiration time in minutes (default: 60)
    /// </summary>
    public int ExpirationMinutes { get; set; } = 60;

    /// <summary>
    /// Maximum retry attempts allowed (default: 5)
    /// </summary>
    public int MaxRetry { get; set; } = 5;

    /// <summary>
    /// Recipient information (e.g., email address, phone number) - optional
    /// </summary>
    [MaxLength(255)]
    public string Recipient { get; set; } = default!;
}
