using AutoMapper;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using sic_api.Data;
using sic_api.Entities.Su;
using sic_api.Mapping;
using sic_api.Model;
using sic_api.Services.Interfaces;

namespace sic_api.Features.Su.Message;

public static class SaveMessage
{
    public class Command : BaseModelState, IRequest<Guid?>, IMapFrom<SuMessage>
    {
        public Guid? Id { get; set; }
        public string ModuleCode { get; set; } = default!;
        public string ProgramCode { get; set; } = default!;
        public string MessageCode { get; set; } = default!;
        public string MessageEn { get; set; } = default!;
        public string MessageLocal { get; set; } = default!;

        public void Mapping(Profile profile)
        {
            profile.CreateMap<Command, SuMessage>()
                .ForMember(destination => destination.RowVersion, options => options.Ignore());
        }
    }

    public class Validator : AbstractValidator<Command>
    {
        public Validator()
        {
            RuleFor(x => x.State)
                .Must(state => state is EntityState.Added or EntityState.Modified)
                .WithMessage("State must be Added or Modified.");

            RuleFor(x => x.Id)
                .NotEmpty()
                .When(x => x.State == EntityState.Modified);

            RuleFor(x => x.RowVersion)
                .NotNull()
                .When(x => x.State == EntityState.Modified);

            RuleFor(x => x.ModuleCode).NotEmpty().MaximumLength(10);
            RuleFor(x => x.ProgramCode).NotEmpty().MaximumLength(50);
            RuleFor(x => x.MessageCode).NotEmpty().MaximumLength(50);
            RuleFor(x => x.MessageEn).NotEmpty().MaximumLength(255);
            RuleFor(x => x.MessageLocal).NotEmpty().MaximumLength(255);
        }
    }

    public sealed class Handler(SicDbContext dbContext, IMapper mapper, IMessageI18nCache messageI18nCache) : IRequestHandler<Command, Guid?>
    {
        public async Task<Guid?> Handle(Command request, CancellationToken cancellationToken)
        {
            request.ModuleCode = request.ModuleCode.Trim();
            request.ProgramCode = request.ProgramCode.Trim();
            request.MessageCode = request.MessageCode.Trim();
            request.MessageEn = request.MessageEn.Trim();
            request.MessageLocal = request.MessageLocal.Trim();

            var hasDuplicate = await dbContext.SuMessages.AnyAsync(
                x => x.ModuleCode == request.ModuleCode &&
                     x.ProgramCode == request.ProgramCode &&
                     x.MessageCode == request.MessageCode &&
                     (request.State != EntityState.Modified || x.Id != request.Id),
                cancellationToken);

            if (hasDuplicate)
            {
                throw new InvalidOperationException("The message code already exists in this module and program.");
            }

            var entity = mapper.Map<SuMessage>(request);

            var item = entity.State switch
            {
                EntityState.Added => entity,
                EntityState.Modified => await dbContext.SuMessages
                    .FirstOrDefaultAsync(x => x.Id == entity.Id, cancellationToken),
                _ => null
            };

            if (item is null)
            {
                return null;
            }

            if (entity.State == EntityState.Modified)
            {
                dbContext.Entry(item).Property(x => x.RowVersion).OriginalValue = request.RowVersion!.Value;
                mapper.Map(request, item);
            }

            if (entity.State == EntityState.Added)
            {
                dbContext.SuMessages.Add(item);
            }

            await dbContext.SaveChangesAsync(cancellationToken);
            messageI18nCache.Remove(request.ModuleCode, request.ProgramCode);
            return item.Id;
        }
    }
}
