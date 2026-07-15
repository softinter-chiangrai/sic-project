using FluentValidation;
using MediatR;
using sic_api.Model;
using sic_api.Services.Interfaces;

namespace sic_api.Features.Dynamic;

public static class SearchDynamicData
{
    public class Request : Pageable
    {
        public string? Keyword { get; set; }
    }

    public class Query : Pageable, IRequest<PaginationBase<Dictionary<string, object?>>>
    {
        public string? ProgramCode { get; set; }

        public string? Keyword { get; set; }

        public Guid? Id { get; set; }
    }

    public class Validator : AbstractValidator<Query>
    {
        public Validator()
        {
            RuleFor(x => x.ProgramCode).NotEmpty();
            RuleFor(x => x.PageNumber).GreaterThan(0);
            RuleFor(x => x.PageSize).GreaterThan(0);
        }
    }

    public sealed class Handler(
        IBusinessAccessService businessAccessService,
        IDynamicDataService dynamicDataService)
        : IRequestHandler<Query, PaginationBase<Dictionary<string, object?>>>
    {
        public async Task<PaginationBase<Dictionary<string, object?>>> Handle(
            Query request,
            CancellationToken cancellationToken)
        {
            var businessId = businessAccessService.GetBusinessId();

            return await dynamicDataService.SearchAsync(
                businessId,
                request,
                cancellationToken);
        }
    }
}