using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Net.Http.Headers;
using System.Text;

namespace sic_api.Controllers.Do
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AdminController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly IHttpClientFactory _httpClientFactory;

        public AdminController(IConfiguration configuration, IHttpClientFactory httpClientFactory)
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

        // GET /api/admin/vllm/status
        [HttpGet("vllm/status")]
        public async Task<IActionResult> GetVllmStatus()
        {
            try
            {
                var (baseUrl, apiKey) = GetConfig();
                using var client = CreateAuthorizedClient(apiKey);
                var response = await client.GetAsync($"{baseUrl}/api/v1/admin/vllm/status");
                var content = await response.Content.ReadAsStringAsync();
                return StatusCode((int)response.StatusCode, content);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"AdminController Error: {ex.Message}");
            }
        }

        // GET /api/admin/vllm/models
        [HttpGet("vllm/models")]
        public async Task<IActionResult> GetVllmModels()
        {
            try
            {
                var (baseUrl, apiKey) = GetConfig();
                using var client = CreateAuthorizedClient(apiKey);
                var response = await client.GetAsync($"{baseUrl}/api/v1/admin/vllm/models");
                var content = await response.Content.ReadAsStringAsync();
                return StatusCode((int)response.StatusCode, content);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"AdminController Error: {ex.Message}");
            }
        }

        // GET /api/admin/vllm/logs
        [HttpGet("vllm/logs")]
        public async Task<IActionResult> GetVllmLogs()
        {
            try
            {
                var (baseUrl, apiKey) = GetConfig();
                using var client = CreateAuthorizedClient(apiKey);
                var response = await client.GetAsync($"{baseUrl}/api/v1/admin/vllm/logs");
                var content = await response.Content.ReadAsStringAsync();
                return StatusCode((int)response.StatusCode, content);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"AdminController Error: {ex.Message}");
            }
        }

        // GET /api/admin/vllm/download_logs
        [HttpGet("vllm/download_logs")]
        public async Task<IActionResult> GetDownloadLogs()
        {
            try
            {
                var (baseUrl, apiKey) = GetConfig();
                using var client = CreateAuthorizedClient(apiKey);
                var response = await client.GetAsync($"{baseUrl}/api/v1/admin/vllm/download_logs");
                var content = await response.Content.ReadAsStringAsync();
                return StatusCode((int)response.StatusCode, content);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"AdminController Error: {ex.Message}");
            }
        }

        // POST /api/admin/vllm/start
        [HttpPost("vllm/start")]
        public async Task<IActionResult> StartVllm()
        {
            try
            {
                var (baseUrl, apiKey) = GetConfig();
                using var client = CreateAuthorizedClient(apiKey);
                using var reader = new StreamReader(Request.Body);
                var body = await reader.ReadToEndAsync();
                var content = new StringContent(body, Encoding.UTF8, "application/json");
                var response = await client.PostAsync($"{baseUrl}/api/v1/admin/vllm/start", content);
                var responseContent = await response.Content.ReadAsStringAsync();
                return StatusCode((int)response.StatusCode, responseContent);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"AdminController Error: {ex.Message}");
            }
        }

        // POST /api/admin/vllm/stop
        [HttpPost("vllm/stop")]
        public async Task<IActionResult> StopVllm()
        {
            try
            {
                var (baseUrl, apiKey) = GetConfig();
                using var client = CreateAuthorizedClient(apiKey);
                var response = await client.PostAsync($"{baseUrl}/api/v1/admin/vllm/stop", null);
                var responseContent = await response.Content.ReadAsStringAsync();
                return StatusCode((int)response.StatusCode, responseContent);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"AdminController Error: {ex.Message}");
            }
        }

        // POST /api/admin/vllm/download
        [HttpPost("vllm/download")]
        public async Task<IActionResult> DownloadModel()
        {
            try
            {
                var (baseUrl, apiKey) = GetConfig();
                using var client = CreateAuthorizedClient(apiKey);
                using var reader = new StreamReader(Request.Body);
                var body = await reader.ReadToEndAsync();
                var content = new StringContent(body, Encoding.UTF8, "application/json");
                var response = await client.PostAsync($"{baseUrl}/api/v1/admin/vllm/download", content);
                var responseContent = await response.Content.ReadAsStringAsync();
                return StatusCode((int)response.StatusCode, responseContent);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"AdminController Error: {ex.Message}");
            }
        }

        // POST /api/admin/vllm/delete
        [HttpPost("vllm/delete")]
        public async Task<IActionResult> DeleteModel()
        {
            try
            {
                var (baseUrl, apiKey) = GetConfig();
                using var client = CreateAuthorizedClient(apiKey);
                using var reader = new StreamReader(Request.Body);
                var body = await reader.ReadToEndAsync();
                var content = new StringContent(body, Encoding.UTF8, "application/json");
                var response = await client.PostAsync($"{baseUrl}/api/v1/admin/vllm/delete", content);
                var responseContent = await response.Content.ReadAsStringAsync();
                return StatusCode((int)response.StatusCode, responseContent);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"AdminController Error: {ex.Message}");
            }
        }
    }
}
