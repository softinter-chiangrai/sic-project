using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Net.Http.Headers;
using System.Text;

namespace sic_api.Controllers.Do
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class OrganizationController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly IHttpClientFactory _httpClientFactory;

        public OrganizationController(IConfiguration configuration, IHttpClientFactory httpClientFactory)
        {
            _configuration = configuration;
            _httpClientFactory = httpClientFactory;
        }

        private (string baseUrl, string apiKey) GetConfig()
        {
            var baseUrl = _configuration["DogBuddy:BaseUrl"] ?? throw new InvalidOperationException("DogBuddy:BaseUrl is not configured.");
            var apiKey = _configuration["DogBuddy:ApiKey"] ?? throw new InvalidOperationException("DogBuddy:ApiKey is not configured.");
            return (baseUrl, apiKey);
        }

        private HttpClient CreateAuthorizedClient(string apiKey)
        {
            var client = _httpClientFactory.CreateClient();
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);

            var email = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value
                     ?? User.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value;
            if (!string.IsNullOrEmpty(email))
            {
                client.DefaultRequestHeaders.Add("X-User-Email", email);
            }

            return client;
        }

        private async Task<IActionResult> ForwardGet(string path)
        {
            try
            {
                var (baseUrl, apiKey) = GetConfig();
                using var client = CreateAuthorizedClient(apiKey);
                var response = await client.GetAsync($"{baseUrl}/api/v1/{path}");
                var content = await response.Content.ReadAsStringAsync();
                return StatusCode((int)response.StatusCode, content);
            }
            catch (Exception ex) { return StatusCode(500, $"OrganizationController Error: {ex.Message}"); }
        }

        private async Task<IActionResult> ForwardPost(string path)
        {
            try
            {
                var (baseUrl, apiKey) = GetConfig();
                using var client = CreateAuthorizedClient(apiKey);
                using var reader = new StreamReader(Request.Body);
                var body = await reader.ReadToEndAsync();
                var content = new StringContent(body, Encoding.UTF8, "application/json");
                var response = await client.PostAsync($"{baseUrl}/api/v1/{path}", content);
                var responseContent = await response.Content.ReadAsStringAsync();
                return StatusCode((int)response.StatusCode, responseContent);
            }
            catch (Exception ex) { return StatusCode(500, $"OrganizationController Error: {ex.Message}"); }
        }

        private async Task<IActionResult> ForwardPatch(string path)
        {
            try
            {
                var (baseUrl, apiKey) = GetConfig();
                using var client = CreateAuthorizedClient(apiKey);
                using var reader = new StreamReader(Request.Body);
                var body = await reader.ReadToEndAsync();
                var content = new StringContent(body, Encoding.UTF8, "application/json");
                var response = await client.PatchAsync($"{baseUrl}/api/v1/{path}", content);
                var responseContent = await response.Content.ReadAsStringAsync();
                return StatusCode((int)response.StatusCode, responseContent);
            }
            catch (Exception ex) { return StatusCode(500, $"OrganizationController Error: {ex.Message}"); }
        }

        private async Task<IActionResult> ForwardDelete(string path)
        {
            try
            {
                var (baseUrl, apiKey) = GetConfig();
                using var client = CreateAuthorizedClient(apiKey);
                var response = await client.DeleteAsync($"{baseUrl}/api/v1/{path}");
                var responseContent = await response.Content.ReadAsStringAsync();
                return StatusCode((int)response.StatusCode, responseContent);
            }
            catch (Exception ex) { return StatusCode(500, $"OrganizationController Error: {ex.Message}"); }
        }

        // ─── TAGS ──────────────────────────────────────────────────────────
        [HttpGet("tags")]
        public Task<IActionResult> GetTags() => ForwardGet("tags");

        [HttpPost("tags")]
        public Task<IActionResult> CreateTag() => ForwardPost("tags");

        [HttpPatch("tags/{id}")]
        public Task<IActionResult> UpdateTag(string id) => ForwardPatch($"tags/{id}");

        [HttpDelete("tags/{id}")]
        public Task<IActionResult> DeleteTag(string id) => ForwardDelete($"tags/{id}");

        // ─── CATEGORIES ────────────────────────────────────────────────────
        [HttpGet("categories")]
        public Task<IActionResult> GetCategories() => ForwardGet("categories");

        [HttpPost("categories")]
        public Task<IActionResult> CreateCategory() => ForwardPost("categories");

        [HttpPatch("categories/{id}")]
        public Task<IActionResult> UpdateCategory(string id) => ForwardPatch($"categories/{id}");

        [HttpDelete("categories/{id}")]
        public Task<IActionResult> DeleteCategory(string id) => ForwardDelete($"categories/{id}");

        // ─── FOLDERS ───────────────────────────────────────────────────────
        [HttpGet("folders")]
        public Task<IActionResult> GetFolders() => ForwardGet("folders");

        [HttpPost("folders")]
        public Task<IActionResult> CreateFolder() => ForwardPost("folders");

        [HttpPatch("folders/{id}")]
        public Task<IActionResult> UpdateFolder(string id) => ForwardPatch($"folders/{id}");

        [HttpDelete("folders/{id}")]
        public Task<IActionResult> DeleteFolder(string id) => ForwardDelete($"folders/{id}");
    }
}
