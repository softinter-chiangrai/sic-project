using System.Data;
using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using sic_api.Data;
using sic_api.Services.Interfaces;

namespace sic_api.Services.Dynamic;

public sealed class AutoRunningService(SicDbContext dbContext) : IAutoRunningService
{
    public async Task<string> GenerateAsync(
        string tableName,
        string columnName,
        string format,
        CancellationToken cancellationToken)
    {
        var now = DateTime.Now;

        var runningMatch = Regex.Match(
            format,
            @"\{RUNING\((\d+)\)\}|\{RUNNING\((\d+)\)\}",
            RegexOptions.IgnoreCase);

        if (!runningMatch.Success)
            return ReplaceDateTokens(format, now);

        var runningLengthText = runningMatch.Groups[1].Success
            ? runningMatch.Groups[1].Value
            : runningMatch.Groups[2].Value;

        var runningLength = int.Parse(runningLengthText);

        var prefixFormat = format[..runningMatch.Index];
        var suffixFormat = format[(runningMatch.Index + runningMatch.Length)..];

        var prefix = ReplaceDateTokens(prefixFormat, now);
        var suffix = ReplaceDateTokens(suffixFormat, now);

        var actualTableName = await ResolveActualTableNameAsync(
            tableName,
            cancellationToken);

        var sql = $"""
            select {Quote(columnName)}
            from {Quote(actualTableName)}
            where {Quote(columnName)} like @prefix
            order by {Quote(columnName)} desc
            limit 1
            """;

        var parameters = new List<NpgsqlParameter>
        {
            new("prefix", $"{prefix}%")
        };

        var lastValue = await ExecuteScalarAsync(
            sql,
            parameters,
            cancellationToken);

        var nextRunning = 1;

        if (lastValue is not null && lastValue != DBNull.Value)
        {
            var text = lastValue.ToString() ?? "";

            if (text.StartsWith(prefix))
            {
                var runningPart = text[prefix.Length..];

                if (!string.IsNullOrEmpty(suffix) && runningPart.EndsWith(suffix))
                {
                    runningPart = runningPart[..^suffix.Length];
                }

                if (int.TryParse(runningPart, out var currentRunning))
                {
                    nextRunning = currentRunning + 1;
                }
            }
        }

        return $"{prefix}{nextRunning.ToString().PadLeft(runningLength, '0')}{suffix}";
    }

    private async Task<string> ResolveActualTableNameAsync(
        string tableName,
        CancellationToken cancellationToken)
    {
        var sql = """
            select table_name
            from information_schema.tables
            where table_schema = current_schema()
              and lower(table_name) = lower(@table_name)
            limit 1
            """;

        var parameters = new List<NpgsqlParameter>
        {
            new("table_name", tableName)
        };

        var result = await ExecuteScalarAsync(
            sql,
            parameters,
            cancellationToken);

        if (result is null || result == DBNull.Value)
        {
            throw new InvalidOperationException(
                $"Dynamic table '{tableName}' does not exist. Please reinstall marketplace or recreate dynamic table.");
        }

        return result.ToString()!;
    }

    private async Task<object?> ExecuteScalarAsync(
        string sql,
        List<NpgsqlParameter> parameters,
        CancellationToken cancellationToken)
    {
        var connection = dbContext.Database.GetDbConnection();

        await using var command = connection.CreateCommand();
        command.CommandText = sql;

        foreach (var parameter in parameters)
        {
            command.Parameters.Add(parameter);
        }

        if (connection.State != ConnectionState.Open)
            await connection.OpenAsync(cancellationToken);

        return await command.ExecuteScalarAsync(cancellationToken);
    }

    private static string ReplaceDateTokens(string format, DateTime date)
    {
        return format
            .Replace("{yyyy}", date.ToString("yyyy"))
            .Replace("{YYYY}", date.ToString("yyyy"))
            .Replace("{yy}", date.ToString("yy"))
            .Replace("{YY}", date.ToString("yy"))
            .Replace("{MM}", date.ToString("MM"))
            .Replace("{dd}", date.ToString("dd"))
            .Replace("{DD}", date.ToString("dd"));
    }

    private static string Quote(string identifier)
    {
        if (string.IsNullOrWhiteSpace(identifier))
            throw new InvalidOperationException("Invalid identifier.");

        return $"\"{identifier.Replace("\"", "\"\"")}\"";
    }
}