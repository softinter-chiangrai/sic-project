using FluentValidation;
using MediatR;
using sic_api.Model.Auth;
using sic_api.Services.Interfaces;

namespace sic_api.Features.Auth;

public static class ChangeBusiness
{
    public class Command : IRequest<ChangeBusinessResponse>
    {
        public Guid BusinessId { get; set; }
        public string? ClientIp { get; set; }
    }

    public class Validator : AbstractValidator<Command>
    {
        public Validator()
        {
            RuleFor(x => x.BusinessId).NotEmpty();
        }
    }

    public sealed class Handler(IBusinessAccessService businessAccessService)
        : IRequestHandler<Command, ChangeBusinessResponse>
    {
        public async Task<ChangeBusinessResponse> Handle(Command request, CancellationToken cancellationToken)
        {
            return await businessAccessService.ChangeBusinessAsync(
                request.BusinessId,
                request.ClientIp,
                cancellationToken);
        }
    }
}
