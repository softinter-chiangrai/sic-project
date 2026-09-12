package com.softinter.sicapi.service;

import java.util.List;

import com.softinter.sicapi.dto.request.AiGenerateSqlRequest;
import com.softinter.sicapi.dto.response.AiGenerateSqlResponse;
import com.softinter.sicapi.entity.pm.PmDiagramSqlHistory;

public interface AiSqlGeneratorService {
    String generateSqlWithAi(String xml, String vendor);

    AiGenerateSqlResponse processAndSaveSql(AiGenerateSqlRequest request);

    List<PmDiagramSqlHistory> getHistoryByTabId(String tabId);
}