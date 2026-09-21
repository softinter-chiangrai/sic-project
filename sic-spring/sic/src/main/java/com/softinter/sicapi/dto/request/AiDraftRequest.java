package com.softinter.sicapi.dto.request;

import java.util.List;

/**
 * Common contract shared by every "generate draft with AI" request DTO (Project, Contract,
 * Requirement, Specification, Test Case, Test Scenario, Delivery, User Manual, Invoice, MA
 * Ticket, ...). Each DTO keeps its own domain-specific fields but implementing this lets the
 * 9+ *GeneratorService classes and any future shared AI-request plumbing depend on one
 * contract instead of duck-typing "does this DTO have getPrompt()/getModel()/getAttachments()".
 *
 * Lombok's @Data on each implementing class already generates matching getters, so implementing
 * this interface is a zero-risk, one-line addition per DTO.
 */
public interface AiDraftRequest {
    String getPrompt();

    String getModel();

    List<AiAttachmentDto> getAttachments();
}
