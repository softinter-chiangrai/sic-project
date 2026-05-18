namespace sic_api.Model;

public class Pageable
{
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public long TotalElements { get; set; }
    public long TotalPages => (TotalElements + PageSize - 1) / PageSize;
    public PageableSort[] Sorts { get; set; } = [];
    public bool HasSort => Sorts.Length > 0;
}

public class PageableCombobox
{
    public string? Keyword { get; set; }
    public Guid? Value { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public long TotalElements { get; set; }
    public long TotalPages => (TotalElements + PageSize - 1) / PageSize;
    public PageableSort[] Sorts { get; set; } = [];
    public bool HasSort => Sorts.Length > 0;
}

public class PageableSort
{
    public string Field { get; set; } = default!;
    public bool Descending { get; set; }
}
