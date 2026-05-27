using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Http;
using sic_api.Model.Storage;
using sic_api.Services.Interfaces;

namespace sic_api.Features.Storage;

public static class UploadStorageFile
{
    public class Command : IRequest<StorageUploadResult>
    {
        public IFormFile File { get; set; } = default!;
        public FileVisibility Visibility { get; set; } = FileVisibility.UploaderOnly;
        public Guid? UploadGroupId { get; set; }
        public FileCategory Category { get; set; }
        public HttpContext? HttpContext { get; set; }
    }

    public class Validator : AbstractValidator<Command>
    {
        public Validator()
        {
            RuleFor(x => x.File).NotNull().WithMessage("File is required.");
            RuleFor(x => x.Category).IsInEnum();
            RuleFor(x => x.Visibility).IsInEnum();
        }
    }

    public sealed class Handler(IFileStorageService fileStorageService) : IRequestHandler<Command, StorageUploadResult>
    {
        public async Task<StorageUploadResult> Handle(Command request, CancellationToken cancellationToken)
        {
            return await fileStorageService.UploadAsync(
                request.File,
                request.Category,
                request.Visibility,
                request.UploadGroupId,
                request.HttpContext,
                cancellationToken);
        }
    }
}
