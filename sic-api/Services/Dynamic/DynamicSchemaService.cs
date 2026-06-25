using Microsoft.EntityFrameworkCore;
using sic_api.Data;
using sic_api.Features.Dynamic;
using sic_api.Services.Interfaces;

namespace sic_api.Services.Dynamic;

public class DynamicSchemaService(SicDbContext dbContext) : IDynamicSchemaService
{
    public async Task<GetDynamicSchema.Response> GetSchemaAsync(
        string programCode,
        CancellationToken cancellationToken)
    {
        var program = await dbContext.MpPrograms
            .AsNoTracking()
            .Include(x => x.Entity)
                .ThenInclude(x => x.Fields)
            .FirstOrDefaultAsync(x =>
                x.ProgramCode == programCode &&
                !x.IsDelete,
                cancellationToken);

        if (program is null)
            throw new InvalidOperationException("Program not found.");

        return new GetDynamicSchema.Response
        {
            ProgramCode = program.ProgramCode,
            NameEn = program.NameEn,
            NameLocal = program.NameLocal,
            Template = program.Template,
            Entity = new GetDynamicSchema.EntityModel
            {
                Name = program.Entity.Name,
                Description = program.Entity.Description,
                LabelEn = program.Entity.LabelEn,
                LabelLocal = program.Entity.LabelLocal,
                Fields = program.Entity.Fields
                    .OrderBy(x => x.SeqNo)
                    .Select(x => new GetDynamicSchema.FieldModel
                    {
                        Name = x.Name,
                        Field = x.Field,
                        Type = x.Type,
                        IsRequired = x.IsRequired,
                        LabelEn = x.LabelEn,
                        LabelLocal = x.LabelLocal,
                        ReferenceEntity = x.ReferenceEntity,
                        SeqNo = x.SeqNo
                    })
                    .ToList()
            }
        };
    }
}