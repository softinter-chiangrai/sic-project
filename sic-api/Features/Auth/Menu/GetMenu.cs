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

        public bool RoleBack { get; set; } = false;

        public bool RoleSearch { get; set; } = false;

        public bool RoleAdd { get; set; } = false;

        public bool RoleSave { get; set; } = false;

        public bool RoleDelete { get; set; } = false;

    public bool RolePrint { get; set; } = false;
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
                .Include( j => j.SuBusinessRolePrograms)
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
                    RoleBack = r.RoleBack && r.SuBusinessRolePrograms!.Any(x => x.RoleBack),
                    RoleSearch = r.RoleSearch && r.SuBusinessRolePrograms!.Any(x => x.RoleSearch),
                    RoleAdd = r.RoleAdd && r.SuBusinessRolePrograms!.Any(x => x.RoleAdd),
                    RoleSave = r.RoleSave && r.SuBusinessRolePrograms!.Any(x => x.RoleSave),
                    RoleDelete = r.RoleDelete && r.SuBusinessRolePrograms!.Any(x => x.RoleDelete),
                    RolePrint = r.RolePrint && r.SuBusinessRolePrograms!.Any(x => x.RolePrint)
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
                    RoleBack = item.RoleBack,
                    RoleSearch = item.RoleSearch,
                    RoleAdd = item.RoleAdd,
                    RoleSave = item.RoleSave,
                    RoleDelete = item.RoleDelete,
                    RolePrint = item.RolePrint,
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
