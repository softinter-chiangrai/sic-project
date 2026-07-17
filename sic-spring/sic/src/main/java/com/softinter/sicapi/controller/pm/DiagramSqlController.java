// src/main/java/com/softinter/sicapi/controller/pm/DiagramSqlController.java
package com.softinter.sicapi.controller.pm;

import com.softinter.sicapi.dto.request.GenerateSqlRequest;
import com.softinter.sicapi.dto.response.GenerateSqlResponse;
import com.softinter.sicapi.service.DiagramSqlService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/diagram")
@RequiredArgsConstructor
public class DiagramSqlController {

    private final DiagramSqlService diagramSqlService;

    @PostMapping("/generate-sql")
    public ResponseEntity<GenerateSqlResponse> generateSql(@RequestBody GenerateSqlRequest request) {
        String sql = diagramSqlService.generateSqlFromXml(request.getXml());
        GenerateSqlResponse response = new GenerateSqlResponse();
        response.setSql(sql);
        return ResponseEntity.ok(response);
    }
}