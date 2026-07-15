using FluentValidation;
using MediatR;
using sic_api.Services.Interfaces;

namespace sic_api.Features.Dynamic;

public static class DeleteDynamicData
{
    public class Command : IRequest<bool>
    {
        public string ProgramCode { get; set; } = default!;

        public Guid Id { get; set; }
    }

    public class Validator : AbstractValidator<Command>
    {
        public Validator()
        {
            RuleFor(x => x.ProgramCode).NotEmpty();
            RuleFor(x => x.Id).NotEmpty();
        }
    }

    public sealed class Handler(
        IBusinessAccessService businessAccessService,
        IDynamicDataService dynamicDataService)
        : IRequestHandler<Command, bool>
    {
        public async Task<bool> Handle(Command request, CancellationToken cancellationToken)
        {
            var businessId = businessAccessService.GetBusinessId();

            return await dynamicDataService.DeleteAsync(
                businessId,
                request.ProgramCode,
                request.Id,
                cancellationToken);
        }
    }
}