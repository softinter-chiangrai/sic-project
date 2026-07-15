using System.Text.Json.Serialization;
using FluentValidation;
using MediatR;
using sic_api.Services.Interfaces;

namespace sic_api.Features.Marketplace;

public static class ImportMarketplace
{
    public class Command : IRequest<Response>
    {
        public Guid Id { get; set; } = Guid.CreateVersion7();

        [JsonPropertyName("appCode")]
        public string AppCode { get; set; } = default!;

        [JsonPropertyName("appName")]
        public string AppName { get; set; } = default!;

        [JsonPropertyName("entities")]
        public List<EntityModel> Entities { get; set; } = [];

        [JsonPropertyName("programs")]
        public List<ProgramModel> Programs { get; set; } = [];
    }

    public class EntityModel
    {
        [JsonPropertyName("name")]
        public string Name { get; set; } = default!;

        [JsonPropertyName("description")]
        public string Description { get; set; } = default!;

        [JsonPropertyName("label_en")]
        public string Label_En { get; set; } = default!;

        [JsonPropertyName("label_local")]
        public string Label_Local { get; set; } = default!;

        [JsonPropertyName("fields")]
        public List<FieldModel> Fields { get; set; } = [];

        [JsonPropertyName("constraints")]
        public List<ConstraintModel> Constraint { get; set; } = [];

        [JsonPropertyName("bilinguals")]
        public List<BilingualModel> Bilingual { get; set; } = [];

        [JsonPropertyName("initial_data")]
        public List<Dictionary<string, object?>> Initial { get; set; } = [];
    }

    public class FieldModel
    {
        [JsonPropertyName("name")]
        public string Name { get; set; } = default!;

        [JsonPropertyName("field")]
        public string Field { get; set; } = default!;

        [JsonPropertyName("type")]
        public string Type { get; set; } = default!;

        [JsonPropertyName("format")]
        public string? Format { get; set; }

        [JsonPropertyName("require")]
        public bool Require { get; set; }

        [JsonPropertyName("reference_entity")]
        public string? Reference_Entity { get; set; }

        [JsonPropertyName("label_en")]
        public string Label_En { get; set; } = default!;

        [JsonPropertyName("label_local")]
        public string Label_Local { get; set; } = default!;

        [JsonPropertyName("seq_no")]
        public int Seq_No { get; set; }
    }

    public class ConstraintModel
    {
        [JsonPropertyName("type")]
        public string Constraint_Type { get; set; } = default!;

        [JsonPropertyName("fields")]
        public List<string> Fields { get; set; } = [];
    }

    public class BilingualModel
    {
        [JsonPropertyName("key")]
        public string Key { get; set; } = default!;

        [JsonPropertyName("key_en")]
        public string Key_En { get; set; } = default!;

        [JsonPropertyName("key_local")]
        public string Key_Local { get; set; } = default!;
    }

    public class ProgramModel
    {
        [JsonPropertyName("program_code")]
        public string ProgramCode { get; set; } = default!;

        [JsonPropertyName("icon")]
        public string Icon { get; set; } = default!;

        [JsonPropertyName("name_en")]
        public string NameEn { get; set; } = default!;

        [JsonPropertyName("name_local")]
        public string NameLocal { get; set; } = default!;

        [JsonPropertyName("template")]
        public string Template { get; set; } = default!;

        [JsonPropertyName("config")]
        public ProgramConfigModel Config { get; set; } = new();

        [JsonPropertyName("entity")]
        public string Entity
        {
            get => Config.Entity;
            set => Config.Entity = value;
        }
    }

    public class ProgramConfigModel
    {
        [JsonPropertyName("entity")]
        public string Entity { get; set; } = default!;
    }

    public class Response
    {
        public Guid Id { get; set; }

        public Guid MarketplaceId { get; set; }

        public string AppCode { get; set; } = default!;

        public string AppName { get; set; } = default!;

        public int EntityCount { get; set; }

        public int ProgramCount { get; set; }

        public string Status { get; set; } = default!;
    }

    public class Validator : AbstractValidator<Command>
    {
        public Validator()
        {
            RuleFor(x => x.Id)
                .NotEmpty();

            RuleFor(x => x.AppCode)
                .NotEmpty()
                .MaximumLength(50);

            RuleFor(x => x.AppName)
                .NotEmpty()
                .MaximumLength(200);

            RuleFor(x => x.Entities)
                .NotNull();

            RuleFor(x => x.Programs)
                .NotNull();

            RuleForEach(x => x.Entities).ChildRules(entity =>
            {
                entity.RuleFor(x => x.Name)
                    .NotEmpty();

                entity.RuleFor(x => x.Description)
                    .NotEmpty();

                entity.RuleFor(x => x.Label_En)
                    .NotEmpty();

                entity.RuleFor(x => x.Label_Local)
                    .NotEmpty();

                entity.RuleFor(x => x.Fields)
                    .NotNull();

                entity.RuleForEach(x => x.Fields).ChildRules(field =>
                {
                    field.RuleFor(x => x.Name)
                        .NotEmpty();

                    field.RuleFor(x => x.Field)
                        .NotEmpty();

                    field.RuleFor(x => x.Type)
                        .NotEmpty();

                    field.RuleFor(x => x.Label_En)
                        .NotEmpty();

                    field.RuleFor(x => x.Label_Local)
                        .NotEmpty();
                });
            });

            RuleForEach(x => x.Programs).ChildRules(program =>
            {
                program.RuleFor(x => x.ProgramCode)
                    .NotEmpty();

                program.RuleFor(x => x.NameEn)
                    .NotEmpty();

                program.RuleFor(x => x.NameLocal)
                    .NotEmpty();

                program.RuleFor(x => x.Template)
                    .NotEmpty();

                program.RuleFor(x => x.Config)
                    .NotNull();

                program.RuleFor(x => x.Config.Entity)
                    .NotEmpty();
            });
        }
    }

    public sealed class Handler(IMarketplaceImportService marketplaceImportService)
        : IRequestHandler<Command, Response>
    {
        public async Task<Response> Handle(
            Command request,
            CancellationToken cancellationToken)
        {
            return await marketplaceImportService.ImportAsync(
                request,
                cancellationToken);
        }
    }
}