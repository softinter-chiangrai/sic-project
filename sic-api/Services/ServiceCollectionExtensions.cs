using Microsoft.EntityFrameworkCore;
using Amazon.Runtime;
using Amazon.S3;
using FluentValidation;
using MediatR;
using sic_api.Data;
using sic_api.Services;
using sic_api.Services.Interfaces;
using System.Reflection;

namespace sic_api.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddValidators(this IServiceCollection services, Assembly assembly)
    {
        var validatorInterfaceType = typeof(IValidator<>);
        var validatorRegistrations = assembly
            .GetTypes()
            .Where(type => type is { IsAbstract: false, IsInterface: false })
            .Select(type => new
            {
                ImplementationType = type,
                ServiceTypes = type.GetInterfaces()
                    .Where(@interface =>
                        @interface.IsGenericType &&
                        @interface.GetGenericTypeDefinition() == validatorInterfaceType)
                    .ToArray()
            })
            .Where(x => x.ServiceTypes.Length > 0);

        foreach (var registration in validatorRegistrations)
        {
            foreach (var serviceType in registration.ServiceTypes)
            {
                services.AddScoped(serviceType, registration.ImplementationType);
            }
        }

        return services;
    }

    public static IServiceCollection AddSicDatabase(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection")
                               ?? throw new InvalidOperationException("Missing DefaultConnection.");

        services.AddDbContext<SicDbContext>((serviceProvider, options) =>
        {
            options.UseNpgsql(connectionString);
        });

        return services;
    }

    public static IServiceCollection AddSicServices(this IServiceCollection services)
    {
        services.AddHttpContextAccessor();
        services.AddScoped<ICurrentUserService, CurrentUserService>();
        services.AddScoped<IBusinessAccessService, BusinessAccessService>();
        services.AddScoped<IProgramAccessService, ProgramAccessService>();
        services.AddSingleton<IProgramAccessCache, ProgramAccessCache>();
        services.AddScoped<IRequestLanguageProvider, RequestLanguageProvider>();
        services.AddScoped<IFileStorageService, FileStorageService>();
        services.AddScoped<IResumableUploadService, ResumableUploadService>();
        services.AddScoped<IMediaProcessingService, MediaProcessingService>();
        services.AddScoped<IMailService, MailService>();
        services.AddScoped<IVerifyService, VerifyService>();
        services.AddHostedService<TemporaryUploadCleanupService>();
        services.AddHostedService<MailQueueProcessorService>();

        return services;
    }

    public static IServiceCollection AddSicStorage(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<StorageOptions>(configuration.GetSection(StorageOptions.SectionName));

        var storageOptions = configuration.GetSection(StorageOptions.SectionName).Get<StorageOptions>()
                             ?? throw new InvalidOperationException("Missing Storage configuration.");

        if (string.IsNullOrWhiteSpace(storageOptions.ServiceUrl))
        {
            throw new InvalidOperationException("Missing Storage:ServiceUrl configuration.");
        }

        var credentials = new BasicAWSCredentials(storageOptions.AccessKey, storageOptions.SecretKey);
        var config = new AmazonS3Config
        {
            ServiceURL = storageOptions.ServiceUrl,
            ForcePathStyle = true
        };

        services.AddSingleton<IAmazonS3>(_ => new AmazonS3Client(credentials, config));

        return services;
    }
}
