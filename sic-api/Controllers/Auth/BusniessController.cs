using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using sic_api.Features.Auth.Business;
using sic_api.Features.Verify;

namespace sic_api.Controllers.Auth;

[Route("api/business")]
[Authorize]
public class BusinessController : BaseController
{

    [HttpGet]
    public async Task<IActionResult> CurrentBusiness(CancellationToken cancellationToken) =>
        Ok(await Mediator.Send(new GetBusinessInfo.Query(), cancellationToken));

    [HttpGet("my-business")]
    public async Task<IActionResult> MyBusiness(CancellationToken cancellationToken) =>
        Ok(await Mediator.Send(new GetMyCompanies.Query(), cancellationToken));

    [HttpPost("change-business")]
    public async Task<IActionResult> ChangeBusiness(
        [FromBody] ChangeBusiness.Command model,
        CancellationToken cancellationToken) =>
        Ok(await Mediator.Send(model, cancellationToken));

    [HttpGet("business-access")]
    public async Task<IActionResult> CurrentAccess(CancellationToken cancellationToken) =>
        Ok(await Mediator.Send(new GetBusinessAccess.Query(), cancellationToken));

    [HttpGet("activation")]
    public async Task<IActionResult> Activation(CancellationToken cancellationToken) =>
        Ok(await Mediator.Send(new GetBusinessActivation.Query(), cancellationToken));

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


    [HttpGet("invite")]
    public async Task<IActionResult> GetInvites(CancellationToken cancellationToken) =>
        Ok(await Mediator.Send(new GetInvites.Query(), cancellationToken));

    [HttpPost("invite")]
    public async Task<IActionResult> CreateInvite([FromBody] CreateInvite.Command model, CancellationToken cancellationToken) =>
        Ok(await Mediator.Send(model, cancellationToken));

    [HttpDelete("invite/{id:guid}")]
    public async Task<IActionResult> DeleteInvite(Guid id, CancellationToken cancellationToken)
    {
        await Mediator.Send(new DeleteInvite.Command { InviteId = id }, cancellationToken);
        return NoContent();
    }

    [HttpPost("join")]
    public async Task<IActionResult> JoinBusiness([FromBody] JoinBusiness.Command model, CancellationToken cancellationToken)
    {
        await Mediator.Send(model, cancellationToken);
        return NoContent();
    }

    [HttpGet("combobox-role")]
    public async Task<IActionResult> ComboboxRole(CancellationToken cancellationToken) =>
        Ok(await Mediator.Send(new GetRolesForBusiness.Query(), cancellationToken));

}
