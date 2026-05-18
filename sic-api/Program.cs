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
using sic_api.Services;
using sic_api.Services.Interfaces;

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
            .AllowAnyMethod();
    });
});

builder.Services.AddKeycloakWebApiAuthentication(
    builder.Configuration,
    jwtBearerOptions =>
    {
        jwtBearerOptions.IncludeErrorDetails = true;
        jwtBearerOptions.SaveToken = true;

        jwtBearerOptions.Events = new JwtBearerEvents
        {
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

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();

app.UseMiddleware<ApiExceptionMiddleware>();
app.UseHttpsRedirection();
app.UseCors("AngularCors");

app.UseAuthentication();
app.UseAuthorization();

app.UseMiddleware<BusinessContextMiddleware>();

app.MapControllers();

app.MapGet("/health", [AllowAnonymous] () => Results.Ok(new
{
    service = "sic-api",
    status = "ok",
    utc = DateTime.UtcNow
}));

await app.RunAsync();
