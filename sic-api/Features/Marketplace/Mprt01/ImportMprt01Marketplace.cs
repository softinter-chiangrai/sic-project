using FluentValidation;
using MediatR;
using sic_api.Services.Interfaces;

namespace sic_api.Features.Marketplace.Mprt01;

public static class ImportMprt01Marketplace
{
    public class Command : IRequest<Response>
    {
        public Guid? Id { get; set; }

        public string AppCode { get; set; } = default!;

        public string AppName { get; set; } = default!;

        public List<EntityModel> Entities { get; set; } = [];

        public List<ProgramModel> Programs { get; set; } = [];
    }

    public class EntityModel
    {
        public string Name { get; set; } = default!;

        public string Description { get; set; } = default!;

        public string Label_En { get; set; } = default!;

        public string Label_Local { get; set; } = default!;

        public List<FieldModel> Fields { get; set; } = [];

        public List<ConstraintModel> Constraints { get; set; } = [];

        public List<BilingualModel> Bilinguals { get; set; } = [];

        public List<Dictionary<string, object?>> Initial_Data { get; set; } = [];
    }

    public class FieldModel
    {
        public string Name { get; set; } = default!;

        public string Field { get; set; } = default!;

        public string Type { get; set; } = default!;

        public string? Format { get; set; }

        public bool Require { get; set; }

        public string? Reference_Entity { get; set; }

        public string Label_En { get; set; } = default!;

        public string Label_Local { get; set; } = default!;

        public int Seq_No { get; set; }
    }

    public class ConstraintModel
    {
        public string Type { get; set; } = default!;

        public List<string> Fields { get; set; } = [];
    }

    public class BilingualModel
    {
        public string Local_Field { get; set; } = default!;

        public string En_Field { get; set; } = default!;
    }

    public class ProgramModel
    {
        public string Program_Code { get; set; } = default!;

        public string Icon { get; set; } = default!;

        public string Name_En { get; set; } = default!;

        public string Name_Local { get; set; } = default!;

        public string Template { get; set; } = default!;

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
                entity.RuleFor(x => x.Name).NotEmpty();
                entity.RuleFor(x => x.Description).NotEmpty();
                entity.RuleFor(x => x.Label_En).NotEmpty();
                entity.RuleFor(x => x.Label_Local).NotEmpty();
                entity.RuleFor(x => x.Fields).NotNull();
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
            var baseCommand = new global::sic_api.Features.Marketplace.ImportMarketplace.Command
            {
                Id = request.Id ?? Guid.CreateVersion7(),
                AppCode = request.AppCode,
                AppName = request.AppName,

                Entities = request.Entities.Select(entity =>
                    new global::sic_api.Features.Marketplace.ImportMarketplace.EntityModel
                    {
                        Name = entity.Name,
                        Description = entity.Description,
                        Label_En = entity.Label_En,
                        Label_Local = entity.Label_Local,

                        Fields = entity.Fields.Select(field =>
                            new global::sic_api.Features.Marketplace.ImportMarketplace.FieldModel
                            {
                                Name = field.Name,
                                Field = field.Field,
                                Type = field.Type,
                                Require = field.Require,
                                Reference_Entity = field.Reference_Entity,
                                Label_En = field.Label_En,
                                Label_Local = field.Label_Local,
                                Seq_No = field.Seq_No
                            }).ToList(),

                        Constraint = entity.Constraints.Select(constraint =>
                            new global::sic_api.Features.Marketplace.ImportMarketplace.ConstraintModel
                            {
                                Constraint_Type = constraint.Type,
                                Fields = constraint.Fields
                            }).ToList(),

                        Bilingual = entity.Bilinguals.Select(bilingual =>
                            new global::sic_api.Features.Marketplace.ImportMarketplace.BilingualModel
                            {
                                Key = bilingual.Local_Field,
                                Key_En = bilingual.En_Field,
                                Key_Local = bilingual.Local_Field
                            }).ToList(),

                        Initial = entity.Initial_Data
                    }).ToList(),

                Programs = request.Programs.Select(program =>
                    new global::sic_api.Features.Marketplace.ImportMarketplace.ProgramModel
                    {
                        ProgramCode = program.Program_Code,
                        Icon = program.Icon,
                        NameEn = program.Name_En,
                        NameLocal = program.Name_Local,
                        Template = program.Template,
                        Config = new global::sic_api.Features.Marketplace.ImportMarketplace.ProgramConfigModel
                        {
                            Entity = program.Entity
                        }
                    }).ToList()
            };

            var result = await marketplaceImportService.ImportAsync(
                baseCommand,
                cancellationToken);

            return new Response
            {
                Id = result.Id,
                MarketplaceId = result.MarketplaceId,
                AppCode = result.AppCode,
                AppName = result.AppName,
                EntityCount = result.EntityCount,
                ProgramCount = result.ProgramCount,
                Status = result.Status
            };
        }
    }
}