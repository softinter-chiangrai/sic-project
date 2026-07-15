using AutoMapper;
using FluentValidation;
using Keycloak.AuthServices.Authentication;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using sic_api.Behaviors;
using Microsoft.IdentityModel.Logging;
using Microsoft.OpenApi;
using Sic.Api;
using sic_api.Extensions;
using sic_api.Filters;
using sic_api.Middleware;
using sic_api.Hubs;
using sic_api.Services;
using sic_api.Services.Interfaces;
using sic_api.Services.Dynamic;
using sic_api.Services.Marketplace;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers(options =>
{
    options.Filters.Add<StorageResponseFilter>();
});
builder.Services.AddMemoryCache();
builder.Services.AddAutoMapper(_ => { }, typeof(Program).Assembly);
builder.Services.AddMediatR(cfg =>
{
    cfg.RegisterServicesFromAssembly(typeof(Program).Assembly);
    cfg.AddOpenBehavior(typeof(ValidationBehavior<,>));
});
builder.Services.AddValidators(typeof(Program).Assembly);

static string SanitizeHeaderValue(string? value)
{
    if (string.IsNullOrWhiteSpace(value))
    {
        return string.Empty;
    }

    return new string(value.Where(ch => ch >= 0x20 && ch <= 0x7E).ToArray());
}

IdentityModelEventSource.ShowPII = builder.Environment.IsDevelopment();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "sic-api",
        Version = "v1"
    });
    options.CustomSchemaIds(type =>
        (type.FullName ?? type.Name)
            .Replace("+", ".")
            .Replace("sic_api.", string.Empty));

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        In = ParameterLocation.Header,
        Description = "Paste your access token here. Swagger UI will send it as: Bearer {token}",
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT"
    });

    options.OperationFilter<AuthorizeOperationFilter>();

    options.AddSecurityRequirement(_ => new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecuritySchemeReference("Bearer"),
            []
        }
    });
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AngularCors", policy =>
    {
        var origins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>() ?? [];
        policy
            .WithOrigins(origins)
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials(); // required for SignalR WebSocket
    });
});

builder.Services.AddScoped<IMarketplaceImportService, MarketplaceImportService>();
builder.Services.AddScoped<IMarketplaceInstallService, MarketplaceInstallService>();
builder.Services.AddScoped<IDynamicSchemaService, DynamicSchemaService>();
builder.Services.AddScoped<IDynamicDataService, DynamicDataService>();
builder.Services.AddScoped<IMarketplaceUninstallService, MarketplaceUninstallService>();
builder.Services.AddScoped<IAutoRunningService, AutoRunningService>();
builder.Services.AddScoped<DynamicTableGeneratorService>();
builder.Services.AddScoped<DynamicInitialDataService>();

builder.Services.AddKeycloakWebApiAuthentication(
    builder.Configuration,
    jwtBearerOptions =>
    {
        jwtBearerOptions.IncludeErrorDetails = true;
        jwtBearerOptions.SaveToken = true;

        jwtBearerOptions.Events = new JwtBearerEvents
        {
            // SignalR WebSocket connections cannot set HTTP headers,
            // so the access token is sent as a query-string parameter.
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"];
                var path = context.HttpContext.Request.Path;
                if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs"))
                    context.Token = accessToken;
                return Task.CompletedTask;
            },
            OnAuthenticationFailed = context =>
            {
                var logger = context.HttpContext.RequestServices
                    .GetRequiredService<ILoggerFactory>()
                    .CreateLogger("JwtBearerDiagnostics");

                logger.LogError(
                    context.Exception,
                    "JWT authentication failed for {Method} {Path}. Authorization header present: {HasAuthorizationHeader}",
                    context.Request.Method,
                    context.Request.Path,
                    context.Request.Headers.ContainsKey("Authorization"));

                if (builder.Environment.IsDevelopment())
                {
                    context.Response.Headers["X-Auth-Failed"] = context.Exception.GetType().Name;
                    context.Response.Headers["X-Auth-Failed-Message"] = SanitizeHeaderValue(context.Exception.Message);
                }

                return Task.CompletedTask;
            },
            OnChallenge = context =>
            {
                var logger = context.HttpContext.RequestServices
                    .GetRequiredService<ILoggerFactory>()
                    .CreateLogger("JwtBearerDiagnostics");

                logger.LogWarning(
                    "JWT challenge for {Method} {Path}. Error: {Error}. Description: {Description}",
                    context.Request.Method,
                    context.Request.Path,
                    context.Error,
                    context.ErrorDescription);

                if (builder.Environment.IsDevelopment() && !string.IsNullOrWhiteSpace(context.ErrorDescription))
                {
                    context.Response.Headers["X-Auth-Error"] = SanitizeHeaderValue(context.Error ?? "invalid_token");
                    context.Response.Headers["X-Auth-Error-Description"] = SanitizeHeaderValue(context.ErrorDescription);
                }

                return Task.CompletedTask;
            }
        };
    });
builder.Services.AddAuthorization();

builder.Services.AddSicDatabase(builder.Configuration);
builder.Services.AddSicStorage(builder.Configuration);
builder.Services.AddSicServices();
builder.Services.AddSingleton<IMessageI18nCache, MessageI18nCache>();
builder.Services.AddSingleton<ChatPresenceStore>();
builder.Services.AddSignalR();

var app = builder.Build();

// Expose Swagger only in development. In production it documents the entire
// attack surface and should not be publicly accessible.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Add security response headers on every response.
// These harden the browser-side attack surface regardless of the CORS policy.
app.Use(async (context, next) =>
{
    context.Response.Headers["X-Content-Type-Options"] = "nosniff";
    context.Response.Headers["X-Frame-Options"] = "DENY";
    context.Response.Headers["Referrer-Policy"] = "strict-origin-when-cross-origin";
    context.Response.Headers["X-Permitted-Cross-Domain-Policies"] = "none";
    context.Response.Headers["Cache-Control"] = "no-store";
    await next();
});

app.UseMiddleware<ApiExceptionMiddleware>();
app.UseHttpsRedirection();
app.UseCors("AngularCors");

app.UseAuthentication();
app.UseAuthorization();

app.UseMiddleware<BusinessContextMiddleware>();

app.MapControllers();
app.MapHub<ChatHub>("/hubs/chat");

app.MapGet("/health", [AllowAnonymous] () => Results.Ok(new
{
    service = "sic-api",
    status = "ok",
    utc = DateTime.UtcNow
}));

await app.RunAsync();
