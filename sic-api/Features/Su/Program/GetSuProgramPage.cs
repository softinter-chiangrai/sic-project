using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using sic_api.Data;
using sic_api.Entities.Su;
using sic_api.Extensions;
using sic_api.Model;

namespace sic_api.Features.Su.Program;

public static class GetSuProgramPage
{
    public sealed class Response
    {
        public Guid Id { get; set; }
        public Guid? ParentProgramId { get; set; }
        public string? ParentProgramCode { get; set; }
        public string ProgramCode { get; set; } = default!;
        public string? Icon { get; set; }
        public string NameEn { get; set; } = default!;
        public string NameLocal { get; set; } = default!;
        public string? RoutePath { get; set; }
        public int SortOrder { get; set; }
        public bool IsActive { get; set; }
        public uint RowVersion { get; set; }
    }

    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<SuProgram, Response>()
                .ForMember(destination => destination.ParentProgramCode, options => options.MapFrom(source => source.ParentProgram == null ? null : source.ParentProgram.ProgramCode));
        }
    }

    public class Query : Pageable, IRequest<PaginationBase<Response>>
    {
        public string? Keyword { get; set; }
    }

    public sealed class Handler(SicDbContext dbContext, IMapper mapper) : IRequestHandler<Query, PaginationBase<Response>>
    {
        public async Task<PaginationBase<Response>> Handle(Query request, CancellationToken cancellationToken)
        {
            var pageNumber = request.PageNumber <= 0 ? 1 : request.PageNumber;
            var pageSize = request.PageSize <= 0 ? 10 : request.PageSize;
            var keyword = request.Keyword?.Trim();

            var query = GetAllSuPrograms.BuildQuery(dbContext);
            query = ApplyKeyword(query, keyword);
            query = query.ApplySorting(request.Sorts, x => x.ProgramCode);

            var totalElements = await query.LongCountAsync(cancellationToken);
            var data = await query
                .ProjectTo<Response>(mapper.ConfigurationProvider)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToArrayAsync(cancellationToken);

            return new PaginationBase<Response>
            {
                Data = data,
                Pageable = new Pageable
                {
                    PageNumber = pageNumber,
                    PageSize = pageSize,
                    TotalElements = totalElements,
                    Sorts = request.Sorts
                }
            };
        }

        private static IQueryable<Entities.Su.SuProgram> ApplyKeyword(IQueryable<Entities.Su.SuProgram> query, string? keyword)
        {
            if (string.IsNullOrWhiteSpace(keyword))
            {
                return query;
            }

            var loweredKeyword = keyword.ToLower();
            var hasSortOrder = int.TryParse(keyword, out var parsedSortOrder);
            var hasBool = bool.TryParse(keyword, out var parsedBool);
            var hasActiveKeyword = loweredKeyword is "active" or "inactive";

            return query.Where(x =>
                EF.Functions.ILike(x.ProgramCode, $"%{keyword}%") ||
                (x.Icon != null && EF.Functions.ILike(x.Icon, $"%{keyword}%")) ||
                EF.Functions.ILike(x.NameEn, $"%{keyword}%") ||
                EF.Functions.ILike(x.NameLocal, $"%{keyword}%") ||
                (x.RoutePath != null && EF.Functions.ILike(x.RoutePath, $"%{keyword}%")) ||
                (x.ParentProgram != null && EF.Functions.ILike(x.ParentProgram.ProgramCode, $"%{keyword}%")) ||
                (hasSortOrder && x.SortOrder == parsedSortOrder) ||
                (hasBool && x.IsActive == parsedBool) ||
                (hasActiveKeyword && x.IsActive == (loweredKeyword == "active")));
        }
    }
}
