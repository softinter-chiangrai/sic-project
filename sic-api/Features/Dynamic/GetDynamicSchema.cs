using FluentValidation;
using MediatR;
using sic_api.Services.Interfaces;

namespace sic_api.Features.Dynamic;

public static class GetDynamicSchema
{
    public class Query : IRequest<Response>
    {
        public string ProgramCode { get; set; } = default!;
    }

    public class Response
    {
        public string ProgramCode { get; set; } = default!;

        public string NameEn { get; set; } = default!;

        public string NameLocal { get; set; } = default!;

        public string Template { get; set; } = default!;

        public EntityModel Entity { get; set; } = default!;
    }

    public class EntityModel
    {
        public string Name { get; set; } = default!;

        public string Description { get; set; } = default!;

        public string LabelEn { get; set; } = default!;

        public string LabelLocal { get; set; } = default!;

        public List<FieldModel> Fields { get; set; } = [];
    }

    public class FieldModel
    {
        public string Name { get; set; } = default!;

        public string Field { get; set; } = default!;

        public string Type { get; set; } = default!;

        public bool IsRequired { get; set; }

        public string LabelEn { get; set; } = default!;

        public string LabelLocal { get; set; } = default!;

        public string? ReferenceEntity { get; set; }

        public int SeqNo { get; set; }
    }

    public class Validator : AbstractValidator<Query>
    {
        public Validator()
        {
            RuleFor(x => x.ProgramCode).NotEmpty();
        }
    }

    public sealed class Handler(IDynamicSchemaService dynamicSchemaService)
        : IRequestHandler<Query, Response>
    {
        public async Task<Response> Handle(Query request, CancellationToken cancellationToken)
        {
            return await dynamicSchemaService.GetSchemaAsync(
                request.ProgramCode,
                cancellationToken);
        }
    }
}