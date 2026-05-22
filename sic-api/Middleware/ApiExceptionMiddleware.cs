using FluentValidation;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace sic_api.Middleware;

public class ApiExceptionMiddleware(RequestDelegate next, ILogger<ApiExceptionMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (ValidationException ex)
        {
            logger.LogWarning(ex, "Validation failed for {Path}", context.Request.Path);

            await WriteJsonAsync(context, StatusCodes.Status400BadRequest, new
            {
                message = "Validation failed.",
                errors = ex.Errors.Select(error => new
                {
                    field = error.PropertyName,
                    message = error.ErrorMessage
                })
            });
        }
        catch (DbUpdateConcurrencyException ex)
        {
            logger.LogWarning(ex, "Concurrency conflict for {Path}", context.Request.Path);

            await WriteJsonAsync(context, StatusCodes.Status409Conflict, new
            {
                message = "The data was changed by another user. Please refresh and try again.",
                code = "concurrency_conflict"
            });
        }
        catch (UnauthorizedAccessException ex)
        {
            // Log at warning level — do not include exception message in the response
            // to avoid leaking internal access-control details.
            logger.LogWarning(ex, "Unauthorized access for {Path}", context.Request.Path);

            await WriteJsonAsync(context, StatusCodes.Status403Forbidden, new
            {
                message = "Access denied."
            });
        }
        catch (InvalidOperationException ex)
        {
            logger.LogWarning(ex, "Invalid operation for {Path}", context.Request.Path);

            await WriteJsonAsync(context, StatusCodes.Status400BadRequest, new
            {
                message = ex.Message
            });
        }
        catch (Exception ex)
        {
            // Catch-all: log the full exception but return a generic message
            // so internal details never reach the client.
            logger.LogError(ex, "Unhandled exception for {Path}", context.Request.Path);

            await WriteJsonAsync(context, StatusCodes.Status500InternalServerError, new
            {
                message = "An unexpected error occurred."
            });
        }
    }

    private static Task WriteJsonAsync(HttpContext context, int statusCode, object payload)
    {
        context.Response.StatusCode = statusCode;
        context.Response.ContentType = "application/json";
        return context.Response.WriteAsync(JsonSerializer.Serialize(payload));
    }
}
