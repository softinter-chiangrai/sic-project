namespace sic_api.Utility;

public static class NameUtility
{
    /// <summary>
    /// Joins an array of strings with the specified separator.
    /// Empty or whitespace-only strings are skipped and no separator is added for them.
    /// </summary>
    /// <param name="names">Array of strings to join.</param>
    /// <param name="separator">Separator to insert between non-empty strings. Default is space.</param>
    /// <returns>Concatenated string with separator only between non-empty elements.</returns>
    /// <example>
    /// JoinNames(new[] { "John", "", "Doe" }) returns "John Doe"
    /// JoinNames(new[] { "John", null, "Doe" }, "-") returns "John-Doe"
    /// </example>
    public static string JoinNames(string?[] names, string separator = " ")
    {
        if (names == null || names.Length == 0)
            return string.Empty;

        // Filter out null and empty/whitespace strings
        var filteredNames = names
            .Where(n => !string.IsNullOrWhiteSpace(n))
            .Select(n => n!.Trim())
            .ToArray();

        return string.Join(separator, filteredNames);
    }

    /// <summary>
    /// Joins multiple strings with the specified separator.
    /// Empty or whitespace-only strings are skipped and no separator is added for them.
    /// </summary>
    /// <param name="separator">Separator to insert between non-empty strings.</param>
    /// <param name="names">Strings to join (params array).</param>
    /// <returns>Concatenated string with separator only between non-empty elements.</returns>
    /// <example>
    /// JoinNames(" ", "John", "", "Doe") returns "John Doe"
    /// JoinNames("-", "John", null, "Doe") returns "John-Doe"
    /// </example>
    public static string JoinNames(string separator, params string[] names)
    {
        if (names == null || names.Length == 0)
            return string.Empty;

        // Filter out null and empty/whitespace strings
        var filteredNames = names
            .Where(n => !string.IsNullOrWhiteSpace(n))
            .Select(n => n.Trim())
            .ToArray();

        return string.Join(separator, filteredNames);
    }

    /// <summary>
    /// Builds a full name by concatenating prefix, first name, and suffix with space separator.
    /// Suitable for use in EF Core LINQ queries with ILike searches.
    /// Null or empty values are excluded from the concatenation.
    /// </summary>
    /// <param name="prefix">Name prefix (e.g., "Dr", "Prof").</param>
    /// <param name="firstName">First or full name.</param>
    /// <param name="suffix">Name suffix (e.g., "Jr", "PhD").</param>
    /// <returns>Concatenated full name with proper spacing.</returns>
    /// <example>
    /// BuildFullName("Dr", "John", "PhD") returns "Dr John PhD"
    /// BuildFullName(null, "John", "Jr") returns "John Jr"
    /// BuildFullName("Dr", "John", null) returns "Dr John"
    /// </example>
    public static string EfJoinName(string? prefix, string? firstName, string? suffix)
    {
        return (prefix != null ? prefix + " " : "") +
               (firstName ?? "") +
               (suffix != null ? " " + suffix : "");
    }
}

