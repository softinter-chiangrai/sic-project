namespace sic_api.Services.Interfaces;

public interface IAutoRunningService
{
    Task<string> GenerateAsync(
        string tableName,
        string columnName,
        string format,
        CancellationToken cancellationToken);
}