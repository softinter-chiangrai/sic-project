using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using sic_api.Data;
using sic_api.Services.Interfaces;

namespace sic_api.Features.Marketplace.Mprt01;

public static class SaveMprt01Marketplace
{
    public class Command : IRequest<Response>
    {
        public Guid? Id { get; set; }

        public string AppCode { get; set; } = default!;

        public string AppName { get; set; } = default!;
    }

    public class Response
    {
        public Guid Id { get; set; }

        public string Status { get; set; } = default!;
    }

    public class Validator : AbstractValidator<Command>
    {
        public Validator()
        {
            RuleFor(x => x.AppCode).NotEmpty().MaximumLength(50);
            RuleFor(x => x.AppName).NotEmpty().MaximumLength(200);
        }
    }

    public sealed class Handler(
        SicDbContext dbContext,
        IBusinessAccessService businessAccessService)
        : IRequestHandler<Command, Response>
    {
        public async Task<Response> Handle(
            Command request,
            CancellationToken cancellationToken)
        {
            var appCode = request.AppCode.Trim();
            var appName = request.AppName.Trim();
            var businessId = businessAccessService.GetBusinessId();

            var duplicate = await dbContext.MpMarketplaces
                .AnyAsync(x =>
                    !x.IsDelete &&
                    x.AppCode == appCode &&
                    x.Id != request.Id,
                    cancellationToken);

            if (duplicate)
                throw new InvalidOperationException("AppCode already exists.");

            if (request.Id is null)
            {
                var entry = dbContext.MpMarketplaces.Add(new()
                {
                    BusinessId = businessId,
                    AppCode = appCode,
                    AppName = appName,
                    CreatedDate = DateTime.UtcNow,
                    UpdatedDate = DateTime.UtcNow
                });

                await dbContext.SaveChangesAsync(cancellationToken);

                return new Response
                {
                    Id = entry.Entity.Id,
                    Status = "CREATED"
                };
            }

            var entity = await dbContext.MpMarketplaces
                .FirstOrDefaultAsync(x =>
                    x.Id == request.Id.Value &&
                    !x.IsDelete,
                    cancellationToken);

            if (entity is null)
                throw new InvalidOperationException("Marketplace not found.");

            entity.AppCode = appCode;
            entity.AppName = appName;
            entity.UpdatedDate = DateTime.UtcNow;

            await dbContext.SaveChangesAsync(cancellationToken);

            return new Response
            {
                Id = entity.Id,
                Status = "UPDATED"
            };
        }
    }
}