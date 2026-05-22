namespace sic_api;

/// <summary>
/// Shared keys for storing server-resolved business context in HttpContext.Items.
/// Using a dedicated class avoids coupling between Data, Services, and Middleware layers.
/// </summary>
internal static class BusinessContextKeys
{
    /// <summary>
    /// Key for the server-resolved active BusinessId stored in HttpContext.Items.
    /// Set by BusinessContextMiddleware after resolving from the database.
    /// Never derived from client-supplied input.
    /// </summary>
    internal const string ActiveBusinessId = "srv:active-business-id";
}
