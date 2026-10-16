package com.softinter.sicapi.service;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.softinter.sicapi.config.ReportServiceProperties;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.time.Duration;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReportServiceClient {

    private final ReportServiceProperties properties;

    // ponytail: thread-bound flag instead of a parameter on every export service; fine while a book is built on one thread
    private static final ThreadLocal<Boolean> BOOK_MODE = ThreadLocal.withInitial(() -> false);

    /**
     * Runs work (the project book) so that every report generated on this thread gets bookMode=true: the templates then leave
     * out their own page number and the book prints its running number instead. The parameter is put into the caller's map,
     * so the local Jasper fallback, which fills with the same map, sees it too.
     */
    /** true while a book is being built on this thread (see inBookMode) */
    public static boolean isBookMode() {
        return BOOK_MODE.get();
    }

    public static <T> T inBookMode(java.util.concurrent.Callable<T> work) throws Exception {
        boolean outer = BOOK_MODE.get(); // a book inside a book keeps the flag for the rest of the outer one
        BOOK_MODE.set(true);
        try {
            return work.call();
        } finally {
            if (!outer) BOOK_MODE.remove();
        }
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class GenerateReportResponse {
        private Long reportFileId;
        private Long reportId;
        private String reportTemplateName;
        private String format;
        private String fileName;
        private String downloadUrl;
        private String generatedAt;
    }

    /**
     * Generate report by calling Report Service and download the resulting binary content (e.g. PDF).
     *
     * @param templateCode The report template code in report-service
     * @param parameters   Parameters to pass into the report template
     * @param format       Output format (e.g. "pdf", "docx", "xlsx")
     * @return Raw file bytes
     */
    public byte[] generateAndDownloadReport(String templateCode, Map<String, Object> parameters, String format) {
        if (BOOK_MODE.get() && parameters != null) {
            parameters.put("bookMode", Boolean.TRUE);
        }
        if (!properties.isEnabled()) {
            throw new IllegalStateException("Report Service client is disabled in configuration.");
        }

        String baseUrl = properties.getBaseUrl();
        if (baseUrl.endsWith("/")) {
            baseUrl = baseUrl.substring(0, baseUrl.length() - 1);
        }

        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(Duration.ofSeconds(properties.getTimeoutSeconds()));
        requestFactory.setReadTimeout(Duration.ofSeconds(properties.getTimeoutSeconds()));

        RestClient restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .requestFactory(requestFactory)
                .defaultHeader("X-Access-Token", properties.getAccessToken())
                .build();

        log.info("Requesting report generation from Report Service: templateCode={}, format={}, url={}",
                templateCode, format, baseUrl + "/api/reports/generate");

        String normalizedCode = templateCode != null ? templateCode.replace("_", "").toUpperCase() : "";
        Map<String, Object> requestBody = Map.of(
                "templateCode", normalizedCode,
                "parameters", parameters != null ? parameters : Map.of(),
                "format", format != null ? format.toLowerCase() : "pdf"
        );

        GenerateReportResponse response = restClient.post()
                .uri("/api/reports/generate")
                .contentType(MediaType.APPLICATION_JSON)
                .body(requestBody)
                .retrieve()
                .body(GenerateReportResponse.class);

        if (response == null || response.getReportFileId() == null) {
            throw new RuntimeException("Empty response or missing reportFileId from Report Service");
        }

        log.info("Report generated successfully in Report Service: fileId={}, fileName={}, downloadUrl={}",
                response.getReportFileId(), response.getFileName(), response.getDownloadUrl());

        // Download the binary content
        String downloadUri = "/api/reports/files/" + response.getReportFileId() + "/download";
        byte[] fileBytes = restClient.get()
                .uri(downloadUri)
                .accept(MediaType.APPLICATION_OCTET_STREAM, MediaType.APPLICATION_PDF, MediaType.ALL)
                .retrieve()
                .body(byte[].class);

        if (fileBytes == null || fileBytes.length == 0) {
            throw new RuntimeException("Downloaded report file is empty from Report Service fileId: " + response.getReportFileId());
        }

        log.info("Report downloaded successfully: fileId={}, size={} bytes", response.getReportFileId(), fileBytes.length);
        return fileBytes;
    }

    public boolean isFallbackEnabled() {
        return properties.isFallbackToLocal();
    }
}
