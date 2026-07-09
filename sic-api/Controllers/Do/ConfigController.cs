using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Net.Http.Headers;
using System.Text;

namespace sic_api.Controllers.Do
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ConfigController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly IHttpClientFactory _httpClientFactory;

        public ConfigController(IConfiguration configuration, IHttpClientFactory httpClientFactory)
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

        // GET: /api/config
        [HttpGet]
        public async Task<IActionResult> GetConfigValues()
        {
            try
            {
                var (baseUrl, apiKey) = GetConfig();
                using var client = CreateAuthorizedClient(apiKey);
                var response = await client.GetAsync($"{baseUrl}/api/v1/config/values/me");
                var content = await response.Content.ReadAsStringAsync();
                return StatusCode((int)response.StatusCode, content);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"ConfigController Error: {ex.Message}");
            }
        }

        // PATCH: /api/config/user
        [HttpPatch("user")]
        public async Task<IActionResult> UpdateUserSettings()
        {
            try
            {
                var (baseUrl, apiKey) = GetConfig();
                using var client = CreateAuthorizedClient(apiKey);
                using var reader = new StreamReader(Request.Body);
                var body = await reader.ReadToEndAsync();
                var content = new StringContent(body, Encoding.UTF8, "application/json");
                var response = await client.PatchAsync($"{baseUrl}/api/v1/config/user_values", content);
                var responseContent = await response.Content.ReadAsStringAsync();
                return StatusCode((int)response.StatusCode, responseContent);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"ConfigController Error: {ex.Message}");
            }
        }

        // PATCH: /api/config/admin
        [HttpPatch("admin")]
        public async Task<IActionResult> UpdateAdminSettings()
        {
            try
            {
                var (baseUrl, apiKey) = GetConfig();
                using var client = CreateAuthorizedClient(apiKey);
                using var reader = new StreamReader(Request.Body);
                var body = await reader.ReadToEndAsync();
                var content = new StringContent(body, Encoding.UTF8, "application/json");
                // Maps to Python PATCH /api/v1/config/values/{id} where id is "global"
                var response = await client.PatchAsync($"{baseUrl}/api/v1/config/values/global", content);
                var responseContent = await response.Content.ReadAsStringAsync();
                return StatusCode((int)response.StatusCode, responseContent);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"ConfigController Error: {ex.Message}");
            }
        }
    }
}
