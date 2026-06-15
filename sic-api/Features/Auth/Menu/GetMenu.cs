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

        public bool IsBack { get; set; } = false;

        public bool IsSearch { get; set; } = false;

        public bool IsAdd { get; set; } = false;

        public bool IsSave { get; set; } = false;

        public bool IsRemove { get; set; } = false;

    public bool IsPrint { get; set; } = false;
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
                    IsBack = r.IsBack && r.SuBusinessRolePrograms!.Any(x => x.IsBack),
                    IsSearch = r.IsSearch && r.SuBusinessRolePrograms!.Any(x => x.IsSearch),
                    IsAdd = r.IsAdd && r.SuBusinessRolePrograms!.Any(x => x.IsAdd),
                    IsSave = r.IsSave && r.SuBusinessRolePrograms!.Any(x => x.IsSave),
                    IsRemove = r.IsRemove && r.SuBusinessRolePrograms!.Any(x => x.IsRemove),
                    IsPrint = r.IsPrint && r.SuBusinessRolePrograms!.Any(x => x.IsPrint)
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
                    IsBack = item.IsBack,
                    IsSearch = item.IsSearch,
                    IsAdd = item.IsAdd,
                    IsSave = item.IsSave,
                    IsRemove = item.IsRemove,
                    IsPrint = item.IsPrint,
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
