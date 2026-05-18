using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace sic_api.Controllers;

[ApiController]
[Route("api/[controller]")]
public abstract class BaseController : ControllerBase
{
    private ISender? mediator;

    protected ISender Mediator => mediator ??= HttpContext.RequestServices.GetRequiredService<ISender>();
}
