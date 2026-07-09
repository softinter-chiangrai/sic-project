using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Net.Http.Headers;
using System.Text;

namespace sic_api.Controllers.Do
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DocumentController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly IHttpClientFactory _httpClientFactory;

        public DocumentController(IConfiguration configuration, IHttpClientFactory httpClientFactory)
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

        // ─── GET /api/document ────────────────────────────────────────────
        [HttpGet]
        public async Task<IActionResult> GetDocuments()
        {
            try
            {
                var (baseUrl, apiKey) = GetConfig();
                using var client = CreateAuthorizedClient(apiKey);
                var response = await client.GetAsync($"{baseUrl}/api/v1/documents");
                var content = await response.Content.ReadAsStringAsync();
                return StatusCode((int)response.StatusCode, content);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"DocumentController Error: {ex.Message}");
            }
        }

        // ─── POST /api/document/upload ────────────────────────────────────
        [HttpPost("upload")]
        [DisableRequestSizeLimit]
        public async Task Upload()
        {
            try
            {
                var (baseUrl, apiKey) = GetConfig();
                using var client = CreateAuthorizedClient(apiKey);

                // Forward the entire multipart form-data body as-is
                var requestMessage = new HttpRequestMessage(HttpMethod.Post, $"{baseUrl}/api/v1/documents/upload");
                
                // Rebuild a MultipartFormDataContent from the incoming form
                var form = Request.Form;
                var multipart = new MultipartFormDataContent();

                // Attach each file
                foreach (var file in form.Files)
                {
                    var fileStream = file.OpenReadStream();
                    var fileContent = new StreamContent(fileStream);
                    fileContent.Headers.ContentType = new MediaTypeHeaderValue(file.ContentType);
                    multipart.Add(fileContent, "files", file.FileName);
                }

                // Attach optional form fields
                if (form.TryGetValue("folder_id", out var folderId) && !string.IsNullOrEmpty(folderId))
                    multipart.Add(new StringContent(folderId!), "folder_id");
                if (form.TryGetValue("category_id", out var categoryId) && !string.IsNullOrEmpty(categoryId))
                    multipart.Add(new StringContent(categoryId!), "category_id");
                if (form.TryGetValue("tag_ids", out var tagIds) && !string.IsNullOrEmpty(tagIds))
                    multipart.Add(new StringContent(tagIds!), "tag_ids");

                requestMessage.Content = multipart;
                using var response = await client.SendAsync(requestMessage);
                var responseContent = await response.Content.ReadAsStringAsync();
                Response.StatusCode = (int)response.StatusCode;
                Response.ContentType = "application/json";
                await Response.Body.WriteAsync(Encoding.UTF8.GetBytes(responseContent));
            }
            catch (Exception ex)
            {
                Response.StatusCode = 500;
                await Response.Body.WriteAsync(Encoding.UTF8.GetBytes($"Upload Error: {ex.Message}"));
            }
        }

        // ─── PATCH /api/document/{id} ─────────────────────────────────────
        [HttpPatch("{id}")]
        public async Task<IActionResult> UpdateDocument(string id)
        {
            try
            {
                var (baseUrl, apiKey) = GetConfig();
                using var client = CreateAuthorizedClient(apiKey);
                using var reader = new StreamReader(Request.Body);
                var body = await reader.ReadToEndAsync();
                var content = new StringContent(body, Encoding.UTF8, "application/json");
                var response = await client.PatchAsync($"{baseUrl}/api/v1/documents/{id}", content);
                var responseContent = await response.Content.ReadAsStringAsync();
                return StatusCode((int)response.StatusCode, responseContent);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"DocumentController Error: {ex.Message}");
            }
        }

        // ─── DELETE /api/document/{id} ────────────────────────────────────
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDocument(string id)
        {
            try
            {
                var (baseUrl, apiKey) = GetConfig();
                using var client = CreateAuthorizedClient(apiKey);
                var response = await client.DeleteAsync($"{baseUrl}/api/v1/documents/{id}");
                var responseContent = await response.Content.ReadAsStringAsync();
                return StatusCode((int)response.StatusCode, responseContent);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"DocumentController Error: {ex.Message}");
            }
        }

        // ─── GET /api/document/{id}/download ──────────────────────────────
        [HttpGet("{id}/download")]
        public async Task Download(string id)
        {
            try
            {
                var (baseUrl, apiKey) = GetConfig();
                using var client = CreateAuthorizedClient(apiKey);
                using var response = await client.GetAsync($"{baseUrl}/api/v1/documents/{id}/download", HttpCompletionOption.ResponseHeadersRead);
                Response.StatusCode = (int)response.StatusCode;
                Response.ContentType = response.Content.Headers.ContentType?.ToString() ?? "application/octet-stream";
                if (response.Content.Headers.ContentDisposition != null)
                    Response.Headers.Append("Content-Disposition", response.Content.Headers.ContentDisposition.ToString());
                using var stream = await response.Content.ReadAsStreamAsync();
                await stream.CopyToAsync(Response.Body);
            }
            catch (Exception ex)
            {
                Response.StatusCode = 500;
                await Response.Body.WriteAsync(Encoding.UTF8.GetBytes($"Download Error: {ex.Message}"));
            }
        }

        // ─── GET /api/document/{id}/view ──────────────────────────────────
        [HttpGet("{id}/view")]
        public async Task View(string id)
        {
            try
            {
                var (baseUrl, apiKey) = GetConfig();
                using var client = CreateAuthorizedClient(apiKey);
                using var response = await client.GetAsync($"{baseUrl}/api/v1/documents/{id}/view?token={apiKey}", HttpCompletionOption.ResponseHeadersRead);
                Response.StatusCode = (int)response.StatusCode;
                Response.ContentType = response.Content.Headers.ContentType?.ToString() ?? "application/octet-stream";
                using var stream = await response.Content.ReadAsStreamAsync();
                await stream.CopyToAsync(Response.Body);
            }
            catch (Exception ex)
            {
                Response.StatusCode = 500;
                await Response.Body.WriteAsync(Encoding.UTF8.GetBytes($"View Error: {ex.Message}"));
            }
        }
    }
}
