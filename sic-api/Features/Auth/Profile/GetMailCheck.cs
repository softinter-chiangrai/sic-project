using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using sic_api.Data;
using sic_api.Entities.Su;
using sic_api.Extensions;
using sic_api.Services.Interfaces;
using System.Security.Claims;

namespace sic_api.Features.Auth.Profile;

public static class GetMailCheck
{
    public class Query : IRequest<bool>
    {
        public string Email { get; set; } = default!;
    }

    public class Validator : AbstractValidator<Query>
    {
        public Validator()
        {
            RuleFor(x => x.Email).NotEmpty();
        }
    }

    public sealed class Handler(SicDbContext dbContext) : IRequestHandler<Query, bool>
    {
        public async Task<bool> Handle(Query request, CancellationToken cancellationToken)
        {
            bool isExists = await dbContext.SuProfiles
                .Where(x => x.Email == request.Email).AnyAsync(cancellationToken);
                return !isExists;
        }
    }
}
