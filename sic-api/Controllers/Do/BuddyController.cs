using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;
using System.IO;

namespace sic_api.Controllers.Do
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class BuddyController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly IHttpClientFactory _httpClientFactory;

        public BuddyController(IConfiguration configuration, IHttpClientFactory httpClientFactory)
        {
            _configuration = configuration;
            _httpClientFactory = httpClientFactory;
        }

        [HttpPost("chat")]
        public async Task Chat()
        {
            try
            {
                var baseUrl = _configuration["DogBuddy:BaseUrl"];
                var apiKey = _configuration["DogBuddy:ApiKey"];

                Console.WriteLine($"[DEBUG] BuddyController hit! Forwarding to: {baseUrl}/api/v1/ai/chat");

                using var client = _httpClientFactory.CreateClient();
                client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);

                var email = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value
                         ?? User.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value;
                if (!string.IsNullOrEmpty(email))
                {
                    client.DefaultRequestHeaders.Add("X-User-Email", email);
                }

                // Read body from incoming request
                using var reader = new StreamReader(Request.Body);
                var bodyString = await reader.ReadToEndAsync();
                var content = new StringContent(bodyString, Encoding.UTF8, "application/json");

                var requestMessage = new HttpRequestMessage(HttpMethod.Post, $"{baseUrl}/api/v1/ai/chat")
                {
                    Content = content
                };

                // Send the request with ResponseHeadersRead so we can stream the response
                using var response = await client.SendAsync(requestMessage, HttpCompletionOption.ResponseHeadersRead);

                Response.StatusCode = (int)response.StatusCode;
                Response.ContentType = response.Content.Headers.ContentType?.ToString() ?? "text/event-stream";

                // Stream back the response and flush immediately so the frontend sees it in real-time
                using var responseStream = await response.Content.ReadAsStreamAsync();
                var buffer = new byte[8192];
                int bytesRead;
                while ((bytesRead = await responseStream.ReadAsync(buffer, 0, buffer.Length)) > 0)
                {
                    await Response.Body.WriteAsync(buffer, 0, bytesRead);
                    await Response.Body.FlushAsync();
                }
            }
            catch (Exception ex)
            {
                Response.StatusCode = 500;
                Response.ContentType = "text/plain";
                var errorBytes = Encoding.UTF8.GetBytes($"BuddyController Error: {ex.Message}");
                await Response.Body.WriteAsync(errorBytes, 0, errorBytes.Length);
            }
        }
    }
}
