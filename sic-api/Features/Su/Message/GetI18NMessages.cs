using MediatR;
using Microsoft.EntityFrameworkCore;
using sic_api.Data;
using FluentValidation;
using sic_api.Services.Interfaces;

namespace sic_api.Features.Su.Message;

public static class GetI18NMessages
{
    public class Query : IRequest<Dictionary<string, Dictionary<string, Dictionary<string, string>>>>
    {
        public string ModuleCode { get; set; } = default!;
        public string ProgramCode { get; set; } = default!;
        public string? LanguageCode { get; set; }
    }

    public class Validator : AbstractValidator<Query>
    {
        public Validator()
        {
            RuleFor(x => x.ModuleCode).NotEmpty().MaximumLength(10);
            RuleFor(x => x.ProgramCode).NotEmpty().MaximumLength(50);
            RuleFor(x => x.LanguageCode).MaximumLength(10);
        }
    }

    public sealed class Handler(SicDbContext dbContext, IMessageI18nCache messageI18nCache)
        : IRequestHandler<Query, Dictionary<string, Dictionary<string, Dictionary<string, string>>>>
    {
        public async Task<Dictionary<string, Dictionary<string, Dictionary<string, string>>>> Handle(
            Query request,
            CancellationToken cancellationToken)
        {
            var languageCode = request.LanguageCode ?? "en";

            return await messageI18nCache.GetOrCreateAsync(
                request.ModuleCode,
                request.ProgramCode,
                languageCode,
                async () =>
                {
                    var useEnglish = string.IsNullOrWhiteSpace(request.LanguageCode) ||
                                     string.Equals(request.LanguageCode, "en", StringComparison.OrdinalIgnoreCase);

                    var messages = await dbContext.SuMessages
                        .AsNoTracking()
                        .Where(x => x.ModuleCode == request.ModuleCode && x.ProgramCode == request.ProgramCode)
                        .OrderBy(x => x.MessageCode)
                        .ToListAsync(cancellationToken);

                    var programMessages = messages.ToDictionary(
                        x => x.MessageCode,
                        x => useEnglish ? x.MessageEn : x.MessageLocal);

                    return new Dictionary<string, Dictionary<string, Dictionary<string, string>>>
                    {
                        [request.ModuleCode] = new Dictionary<string, Dictionary<string, string>>
                        {
                            [request.ProgramCode] = programMessages
                        }
                    };
                });
        }
    }
}
