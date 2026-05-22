using AutoMapper;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using sic_api.Data;
using sic_api.Entities.Su;
using sic_api.Mapping;
using sic_api.Model;
using sic_api.Model.Verify;
using sic_api.Services.Interfaces;
using System.Text.Json;
using System.Web;

namespace sic_api.Features.Verify;

public static class PostSendVerify
{
    public class Command : IRequest<GenerateVerifyTokenRequest>, IMapFrom<SuVerify>
    {
        public string VerifyType { get; set; } = default!;

        public string Recipient { get; set; } = default!;

        public void Mapping(Profile profile)
        {
            profile.CreateMap<Command, SuVerify>()
                .ForMember(destination => destination.RowVersion, options => options.Ignore())
                .ForMember(destination => destination.ReferenceNumber, options => options.Ignore())
                .ForMember(destination => destination.Token, options => options.Ignore())
                .ForMember(destination => destination.MaxRetry, options => options.Ignore())
                .ForMember(destination => destination.RetryCount, options => options.Ignore())
                .ForMember(destination => destination.ExpireAt, options => options.Ignore());
        }
    }

    private static readonly IReadOnlySet<string> AllowedVerifyTypes =
        new HashSet<string>(StringComparer.OrdinalIgnoreCase) { "Email" };

    public class Validator : AbstractValidator<Command>
    {
        public Validator()
        {
            RuleFor(x => x.VerifyType)
                .NotEmpty()
                .MaximumLength(100)
                .Must(t => AllowedVerifyTypes.Contains(t ?? string.Empty))
                .WithMessage($"VerifyType must be one of: {string.Join(", ", AllowedVerifyTypes)}.");

            // Validate email format when the recipient is used as an email address
            RuleFor(x => x.Recipient)
                .NotEmpty()
                .MaximumLength(320)
                .EmailAddress()
                .When(x => string.Equals(x.VerifyType, "Email", StringComparison.OrdinalIgnoreCase));
        }
    }

    public sealed class Handler(IVerifyService verifyService, IMailService mailService, IRequestLanguageProvider requestLanguageProvider) : IRequestHandler<Command, GenerateVerifyTokenRequest>
    {
        public async Task<GenerateVerifyTokenRequest> Handle(Command request, CancellationToken cancellationToken)
        {
            var referenceNumber = Guid.CreateVersion7().ToString();

            var generateRequest = new GenerateVerifyTokenRequest
            {
                VerifyType = request.VerifyType,
                ReferenceNumber = referenceNumber,
                Recipient = request.Recipient
            };

            var response = await verifyService.GenerateTokenAsync(generateRequest);
            
            // If VerifyType is "Email", send verification email
            if (request.VerifyType == "Email" && !string.IsNullOrEmpty(request.Recipient))
            {
                var useEnglish = requestLanguageProvider.UseEnglish();

                await SendVerificationEmailAsync(
                    request.Recipient, 
                    response.Token, 
                    useEnglish);
            }

            return generateRequest;
        }

        private async Task<Guid> SendVerificationEmailAsync(string recipientEmail, string verifyToken, bool useEnglish)
        {
            try
            {
                var bodyData = new
                {
                    RecipientEmail = recipientEmail,
                    VerifyToken = verifyToken,
                    ExpirationMinutes = 30,
                    VerificationLink = $"https://yourdomain.com/verify?token={HttpUtility.UrlEncode(verifyToken)}"
                };

                var bodyDataJson = JsonSerializer.Serialize(bodyData);
                
                var queueId = await mailService.AddToQueueAsync(
                    templateCode: "VERIFY_EMAIL",
                    recipientEmail: recipientEmail,
                    recipientName: recipientEmail,
                    bodyData: bodyDataJson,
                    useEnglish: useEnglish);

                return queueId;
            }
            catch (Exception)
            {
                // Log error but don't fail the token generation
                return Guid.Empty;
            }
        }
    }
}
