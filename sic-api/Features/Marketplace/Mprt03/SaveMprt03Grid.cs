using FluentValidation;
using MediatR;
using sic_api.Services.Interfaces;

namespace sic_api.Features.Marketplace.Mprt03;

public static class SaveMprt03Grid
{
    public class Command : IRequest<Response>
    {
        public string? ProgramCode { get; set; }

        public List<RowModel> Rows { get; set; } = [];
    }

    public class RowModel
    {
        public Guid? Id { get; set; }

        public uint RowVersion { get; set; }

        public int State { get; set; }

        public Dictionary<string, object?> Data { get; set; } = [];
    }

    public class Response
    {
        public int Total { get; set; }

        public int Created { get; set; }

        public int Updated { get; set; }

        public int Deleted { get; set; }

        public List<RowResult> Results { get; set; } = [];
    }

    public class RowResult
    {
        public Guid? Id { get; set; }

        public int State { get; set; }

        public string Status { get; set; } = default!;

        public string? Message { get; set; }
    }

    public class Validator : AbstractValidator<Command>
    {
        public Validator()
        {
            RuleFor(x => x.ProgramCode).NotEmpty();
            RuleFor(x => x.Rows).NotNull();

            RuleForEach(x => x.Rows).ChildRules(row =>
            {
                row.RuleFor(x => x.State)
                    .Must(x => x is 2 or 3 or 4)
                    .WithMessage("State ต้องเป็น 2, 3 หรือ 4 เท่านั้น");

                row.When(x => x.State is 2 or 3, () =>
                {
                    row.RuleFor(x => x.Id)
                        .NotEmpty()
                        .WithMessage("Id is required for update/delete");
                });
            });
        }
    }

    public sealed class Handler(
        IBusinessAccessService businessAccessService,
        IDynamicDataService dynamicDataService)
        : IRequestHandler<Command, Response>
    {
        public async Task<Response> Handle(
            Command request,
            CancellationToken cancellationToken)
        {
            var businessId = businessAccessService.GetBusinessId();

            var response = new Response
            {
                Total = request.Rows.Count
            };

            foreach (var row in request.Rows)
            {
                try
                {
                    switch (row.State)
                    {
                        case 4:
                        {
                            var id = await dynamicDataService.CreateAsync(
                                businessId,
                                request.ProgramCode!,
                                row.Data,
                                cancellationToken);

                            response.Created++;

                            response.Results.Add(new RowResult
                            {
                                Id = id,
                                State = row.State,
                                Status = "CREATED"
                            });

                            break;
                        }

                        case 3:
                        {
                            await dynamicDataService.UpdateAsync(
                                businessId,
                                request.ProgramCode!,
                                row.Id!.Value,
                                row.Data,
                                cancellationToken);

                            response.Updated++;

                            response.Results.Add(new RowResult
                            {
                                Id = row.Id,
                                State = row.State,
                                Status = "UPDATED"
                            });

                            break;
                        }

                        case 2:
                        {
                            await dynamicDataService.DeleteAsync(
                                businessId,
                                request.ProgramCode!,
                                row.Id!.Value,
                                cancellationToken);

                            response.Deleted++;

                            response.Results.Add(new RowResult
                            {
                                Id = row.Id,
                                State = row.State,
                                Status = "DELETED"
                            });

                            break;
                        }
                    }
                }
                catch (Exception ex)
                {
                    response.Results.Add(new RowResult
                    {
                        Id = row.Id,
                        State = row.State,
                        Status = "ERROR",
                        Message = ex.Message
                    });
                }
            }

            return response;
        }
    }
}