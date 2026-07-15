using FluentValidation;
using MediatR;
using sic_api.Services.Interfaces;

namespace sic_api.Features.Dynamic;

public static class GetDynamicData
{
    public class Query : IRequest<Dictionary<string, object?>?>
    {
        public string ProgramCode { get; set; } = default!;

        public Guid Id { get; set; }
    }

    public class Validator : AbstractValidator<Query>
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
        : IRequestHandler<Query, Dictionary<string, object?>?>
    {
        public async Task<Dictionary<string, object?>?> Handle(
            Query request,
            CancellationToken cancellationToken)
        {
            var businessId = businessAccessService.GetBusinessId();

            return await dynamicDataService.GetByIdAsync(
                businessId,
                request.ProgramCode,
                request.Id,
                cancellationToken);
        }
    }
}