using MediatR;
using Microsoft.EntityFrameworkCore;
using sic_api.Data;
using sic_api.Model;
using sic_api.Services.Interfaces;

namespace sic_api.Features.Auth.Menu;

public static class GetMenu
{
    public class Query : IRequest<Response[]?>
    {
    }

    public class Response : BaseModelState
    {
        public string Name { get; set; } = default!;
        public string? Icon { get; set; } = default;
        public string? Path { get; set; } = default;
        public string? Code { get; set; } = default;
        public List<Response> Children { get; set; } = new List<Response>();
    }

    public sealed class Handler( SicDbContext dbContext,IRequestLanguageProvider requestLanguageProvider, IBusinessAccessService businessAccessService, ICurrentUserService currentUserService)
        : IRequestHandler<Query, Response[]?>
    {
        public async Task<Response[]?> Handle(Query request, CancellationToken cancellationToken)
        {
            var businessId = businessAccessService.GetBusinessId();
            var userId = currentUserService.GetUserId();
            var useEnglish = requestLanguageProvider.UseEnglish();

            var allPrograms = await dbContext.SuPrograms.AsNoTracking()
                .Where(
                    r => r.SuBusinessRolePrograms!.Any(x => x.BusinessRole.BusinessId == businessId)
                    && r.SuBusinessRolePrograms!.Any(x => x.BusinessRole.UserBusinessRoles.Any(ubr => ubr.UserBusiness.UserId == userId))
                    && r.IsActive
                    && r.SuBusinessRolePrograms!.Any(x => x.BusinessRole.IsActive)
                    && r.SuBusinessRolePrograms!.Any(x => x.BusinessRole.UserBusinessRoles.Any(ubr => ubr.IsActive))
                    && r.SuBusinessRolePrograms!.Any(x => x.BusinessRole.UserBusinessRoles.Any(ubr => ubr.UserBusiness.IsActive))
                )
                .Select(r => new
                {
                    r.Id,
                    r.ParentProgramId,
                    r.ProgramCode,
                    Name = useEnglish ? r.NameEn : r.NameLocal,
                    r.Icon,
                    Path = r.RoutePath,
                    Code = r.ProgramCode,
                    r.SortOrder,
                })
                .ToListAsync(cancellationToken);

            var lookup = allPrograms.ToLookup(p => p.ParentProgramId);

            Response BuildNode(Guid id)
            {
                var item = allPrograms.First(p => p.Id == id);
                return new Response
                {
                    Name = item.Name,
                    Icon = item.Icon,
                    Path = item.Path,
                    Code = item.Code,
                    Children = lookup[id]
                        .OrderBy(p => p.SortOrder).ThenBy(p=>p.ProgramCode)
                        .Select(p => BuildNode(p.Id))
                        .ToList()
                };
            }

            var roots = lookup[null]
                .OrderBy(p => p.SortOrder).ThenBy(p => p.ProgramCode)
                .Select(p => BuildNode(p.Id))
                .ToArray();

            return roots.Length > 0 ? roots : null;
        }
    }
}
