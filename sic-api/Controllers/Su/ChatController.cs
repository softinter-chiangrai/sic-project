using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using sic_api.Controllers;
using sic_api.Features.Su.Chat;

namespace sic_api.Controllers.Su;

[Route("api/su/chat")]
[Authorize]
public class ChatController : BaseController
{
    /// <summary>GET /api/su/chat/members — members in same business with online status</summary>
    [HttpGet("members")]
    public async Task<IActionResult> GetMembers(CancellationToken cancellationToken) =>
        Ok(await Mediator.Send(new GetChatMembers.Query { User = User }, cancellationToken));

    /// <summary>GET /api/su/chat/history/{peerUserId} — paginated chat history</summary>
    [HttpGet("history/{peerUserId}")]
    public async Task<IActionResult> GetHistory(
        string peerUserId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        CancellationToken cancellationToken = default) =>
        Ok(await Mediator.Send(new GetChatHistory.Query
        {
            User = User,
            PeerUserId = peerUserId,
            Page = page,
            PageSize = pageSize,
        }, cancellationToken));

    /// <summary>GET /api/su/chat/groups — groups the current user belongs to</summary>
    [HttpGet("groups")]
    public async Task<IActionResult> GetGroups(CancellationToken cancellationToken) =>
        Ok(await Mediator.Send(new GetChatGroups.Query { User = User }, cancellationToken));

    /// <summary>GET /api/su/chat/groups/{groupId}/history — paginated group message history</summary>
    [HttpGet("groups/{groupId:guid}/history")]
    public async Task<IActionResult> GetGroupHistory(
        Guid groupId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        CancellationToken cancellationToken = default) =>
        Ok(await Mediator.Send(new GetGroupChatHistory.Query
        {
            User = User,
            GroupId = groupId,
            Page = page,
            PageSize = pageSize,
        }, cancellationToken));
}

