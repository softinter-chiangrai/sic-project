package com.softinter.sicapi.service.impl;

import com.softinter.sicapi.entity.pm.PmCustomer;
import com.softinter.sicapi.entity.pm.PmCustomerContract;
import com.softinter.sicapi.entity.pm.PmCustomerProject;
import com.softinter.sicapi.entity.pm.PmMaTicket;
import com.softinter.sicapi.repository.pm.PmCustomerContractRepository;
import com.softinter.sicapi.repository.pm.PmCustomerProjectRepository;
import com.softinter.sicapi.repository.pm.PmCustomerRepository;
import com.softinter.sicapi.repository.pm.PmMaTicketRepository;
import com.softinter.sicapi.service.PmMaTicketExportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.sf.jasperreports.engine.*;
import net.sf.jasperreports.engine.data.JRBeanCollectionDataSource;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class PmMaTicketExportServiceImpl implements PmMaTicketExportService {

    private final PmMaTicketRepository ticketRepository;
    private final PmCustomerRepository customerRepository;
    private final PmCustomerProjectRepository projectRepository;
    private final PmCustomerContractRepository contractRepository;

    private static final DateTimeFormatter DISPLAY_FORMATTER =
            DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm").withZone(ZoneId.of("Asia/Bangkok"));

    public static class TicketReportDto {
        private final String ticketNo;
        private final String title;
        private final String customerName;
        private final String projectName;
        private final String contractNo;
        private final String ticketType;
        private final String severity;
        private final String status;
        private final String reportedBy;
        private final String reportedDate;
        private final String assignedTo;
        private final String resolvedDate;
        private final String description;
        private final String resolutionSummary;

        public TicketReportDto(String ticketNo, String title, String customerName,
                               String projectName, String contractNo, String ticketType,
                               String severity, String status, String reportedBy,
                               String reportedDate, String assignedTo, String resolvedDate,
                               String description, String resolutionSummary) {
            this.ticketNo = ticketNo;
            this.title = title;
            this.customerName = customerName;
            this.projectName = projectName;
            this.contractNo = contractNo;
            this.ticketType = ticketType;
            this.severity = severity;
            this.status = status;
            this.reportedBy = reportedBy;
            this.reportedDate = reportedDate;
            this.assignedTo = assignedTo;
            this.resolvedDate = resolvedDate;
            this.description = description;
            this.resolutionSummary = resolutionSummary;
        }

        public String getTicketNo() { return ticketNo; }
        public String getTitle() { return title; }
        public String getCustomerName() { return customerName; }
        public String getProjectName() { return projectName; }
        public String getContractNo() { return contractNo; }
        public String getTicketType() { return ticketType; }
        public String getSeverity() { return severity; }
        public String getStatus() { return status; }
        public String getReportedBy() { return reportedBy; }
        public String getReportedDate() { return reportedDate; }
        public String getAssignedTo() { return assignedTo; }
        public String getResolvedDate() { return resolvedDate; }
        public String getDescription() { return description; }
        public String getResolutionSummary() { return resolutionSummary; }
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] exportTicketPdf(UUID ticketId, UUID businessId) {
        log.info("Generating Ticket PDF: id={}, businessId={}", ticketId, businessId);

        PmMaTicket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found: " + ticketId));

        String customerName = "-";
        if (ticket.getCustomerId() != null) {
            customerName = customerRepository.findById(ticket.getCustomerId())
                    .map(PmCustomer::getCompanyNameLocal)
                    .orElse("-");
        }

        String projectName = "-";
        if (ticket.getProjectId() != null) {
            projectName = projectRepository.findById(ticket.getProjectId())
                    .map(PmCustomerProject::getProjectName)
                    .orElse("-");
        }

        String contractNo = "-";
        if (ticket.getContractId() != null) {
            contractNo = contractRepository.findById(ticket.getContractId())
                    .map(PmCustomerContract::getContractNo)
                    .orElse("-");
        }

        String reportedDateStr = ticket.getReportedDate() != null
                ? DISPLAY_FORMATTER.format(ticket.getReportedDate()) : "-";
        String resolvedDateStr = ticket.getResolvedDate() != null
                ? DISPLAY_FORMATTER.format(ticket.getResolvedDate()) : "-";

        String exportDate = DISPLAY_FORMATTER.format(java.time.Instant.now());

        TicketReportDto dto = new TicketReportDto(
                ticket.getTicketNo(),
                ticket.getTitle(),
                customerName,
                projectName,
                contractNo,
                ticket.getTicketType() != null ? ticket.getTicketType().name() : "GENERAL",
                ticket.getSeverity() != null ? ticket.getSeverity().name() : "MEDIUM",
                ticket.getStatus() != null ? ticket.getStatus().name() : "OPEN",
                ticket.getReportedBy() != null ? ticket.getReportedBy() : "-",
                reportedDateStr,
                ticket.getAssignedTo() != null ? ticket.getAssignedTo() : "Unassigned",
                resolvedDateStr,
                stripHtml(ticket.getDescription()),
                stripHtml(ticket.getResolutionSummary())
        );

        try {
            ClassPathResource templateResource = new ClassPathResource("reports/ticket_report.jrxml");
            JasperReport jasperReport;
            try (InputStream is = templateResource.getInputStream()) {
                jasperReport = JasperCompileManager.compileReport(is);
            }

            Map<String, Object> parameters = new HashMap<>();
            parameters.put("exportDate", exportDate);

            JRBeanCollectionDataSource dataSource = new JRBeanCollectionDataSource(Collections.singletonList(dto));
            JasperPrint jasperPrint = JasperFillManager.fillReport(jasperReport, parameters, dataSource);

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            JasperExportManager.exportReportToPdfStream(jasperPrint, baos);

            return baos.toByteArray();
        } catch (Exception e) {
            log.error("Failed to generate Ticket PDF: {}", e.getMessage(), e);
            throw new RuntimeException("Error generating Ticket PDF: " + e.getMessage(), e);
        }
    }

    private String stripHtml(String html) {
        if (html == null || html.isBlank()) return "-";
        return html.replaceAll("<[^>]*>", " ")
                   .replaceAll("&nbsp;", " ")
                   .replaceAll("&amp;", "&")
                   .replaceAll("&lt;", "<")
                   .replaceAll("&gt;", ">")
                   .replaceAll(" +", " ")
                   .trim();
    }
}
