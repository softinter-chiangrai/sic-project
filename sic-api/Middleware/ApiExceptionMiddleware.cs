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
        catch (InvalidOperationException ex)
        {
            logger.LogWarning(ex, "Invalid operation for {Path}", context.Request.Path);

            await WriteJsonAsync(context, StatusCodes.Status400BadRequest, new
            {
                message = ex.Message
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
