using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using sic_api.Features.Bu.Rt.Budt01;
using sic_api.Filters;

namespace sic_api.Controllers.Bu.Rt;

[Authorize]
[Route("api/bu/burt01")]
[ProgramAuthorize("BURT01")]
public class Budt01Controller : BaseController
{
    [HttpGet]
    public async Task<IActionResult> GetBusinessInfo([FromQuery] GetBusinessInfo.Query model, CancellationToken cancellationToken) =>
        Ok(await Mediator.Send(model, cancellationToken));

    [HttpPost("save")]
    public async Task<IActionResult> SaveBusinessInfo([FromBody] SaveBusinessInfo.Command model, CancellationToken cancellationToken) =>
        Ok(await Mediator.Send(model, cancellationToken));

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
}