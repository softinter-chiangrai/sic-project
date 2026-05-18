using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using sic_api.Features.Auth.Profile;
using sic_api.Features.Verify;

namespace sic_api.Controllers.Auth;

[Route("api/profile")]
[Authorize]
public class ProfileController : BaseController
{
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

    [HttpGet("me")]
    public async Task<IActionResult> Me([FromQuery] GetMe.Query model, CancellationToken cancellationToken) =>
        Ok(await Mediator.Send(model, cancellationToken));

    [HttpGet("mail-check")]
    public async Task<IActionResult> MailCheck([FromQuery] GetMailCheck.Query model, CancellationToken cancellationToken) =>
        Ok(await Mediator.Send(model, cancellationToken));

    [HttpPost("send-verify")]
    public async Task<IActionResult> SendVerify([FromBody] PostSendVerify.Command model, CancellationToken cancellationToken) =>
        Ok(await Mediator.Send(model, cancellationToken));

    [HttpPost("save")]
    public async Task<IActionResult> Save([FromBody] SaveProfile.Command model, CancellationToken cancellationToken) =>
        Ok(await Mediator.Send(model, cancellationToken));

}
