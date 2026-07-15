using FluentValidation;
using MediatR;
using sic_api.Services.Interfaces;

namespace sic_api.Features.Dynamic;

public static class UpdateDynamicData
{
    public class Command : IRequest<Guid?>
    {
        public string ProgramCode { get; set; } = default!;

        public Guid Id { get; set; }

        public Dictionary<string, object?> Data { get; set; } = [];
    }

    public class Validator : AbstractValidator<Command>
    {
        public Validator()
        {
            RuleFor(x => x.ProgramCode).NotEmpty();
            RuleFor(x => x.Id).NotEmpty();
            RuleFor(x => x.Data).NotNull();
        }
    }

    public sealed class Handler(
        IBusinessAccessService businessAccessService,
        IDynamicDataService dynamicDataService)
        : IRequestHandler<Command, Guid?>
    {
        public async Task<Guid?> Handle(Command request, CancellationToken cancellationToken)
        {
            var businessId = businessAccessService.GetBusinessId();

            return await dynamicDataService.UpdateAsync(
                businessId,
                request.ProgramCode,
                request.Id,
                request.Data,
                cancellationToken);
        }
    }
}