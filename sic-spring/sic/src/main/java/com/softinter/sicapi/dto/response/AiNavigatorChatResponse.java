package com.softinter.sicapi.dto.response;

import java.util.List;

import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiNavigatorChatResponse {
    private String answer;
    private List<AiRouteSuggestionDto> suggestedRoutes;

    /** Set when the user's intent is to CREATE data for a known module (e.g. "TEST_CASE"). */
    private String openBatchModuleType;

    /** Exact route to navigate to + auto-open that module's AI create modal (resolved server-side, never trusted from the LLM). */
    private String openBatchRoute;
}
