using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using sic_api.Features.Auth.Business;
using sic_api.Features.Verify;

namespace sic_api.Controllers.Auth;

[Route("api/business")]
[Authorize]
public class BusinessController : BaseController
{
    [HttpGet("lov-person-type")]
    public async Task<IActionResult> LovPersonType([FromQuery] GetLovPersonType.Query model, CancellationToken cancellationToken) =>
        Ok(await Mediator.Send(model, cancellationToken));

    [HttpGet("combobox-title")]
    public async Task<IActionResult> ComboboxTitle([FromQuery] GetComboboxTitle.Query model, CancellationToken cancellationToken) =>
        Ok(await Mediator.Send(model, cancellationToken));

    [HttpGet("combobox-country")]
    public async Task<IActionResult> ComboboxCountry([FromQuery] GetComboboxCountry.Query model, CancellationToken cancellationToken) =>
        Ok(await Mediator.Send(model, cancellationToken));

    [HttpGet("combobox-province")]
    public async Task<IActionResult> ComboboxProvince([FromQuery] GetComboboxProvince.Query model, CancellationToken cancellationToken) =>
        Ok(await Mediator.Send(model, cancellationToken));

    [HttpGet("combobox-district")]
    public async Task<IActionResult> ComboboxDistrict([FromQuery] GetComboboxDistrict.Query model, CancellationToken cancellationToken) =>
        Ok(await Mediator.Send(model, cancellationToken));

    [HttpGet("combobox-sub-district")]
    public async Task<IActionResult> ComboboxSubDistrict([FromQuery] GetComboboxSubDistrict.Query model, CancellationToken cancellationToken) =>
        Ok(await Mediator.Send(model, cancellationToken));

    [HttpPost("save")]
    public async Task<IActionResult> Save([FromBody] SaveBusiness.Command model, CancellationToken cancellationToken) =>
        Ok(await Mediator.Send(model, cancellationToken));

}
