package com.softinter.sicapi.controller.basic;

import java.util.Arrays;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.softinter.sicapi.dto.response.NegotiateResponse;
import com.softinter.sicapi.dto.response.TransportResponse;  
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/hubs/chat")
@Tag(name = "Chat Hub", description = "SignalR Chat Hub")
@RequiredArgsConstructor
public class ChatHubController {

    @PostMapping("/negotiate")
    @Operation(summary = "SignalR negotiation")
    public ResponseEntity<NegotiateResponse> negotiate(
            @RequestParam(value = "negotiateVersion", defaultValue = "1") int negotiateVersion) {

        NegotiateResponse response = new NegotiateResponse();
        response.setNegotiateVersion(negotiateVersion);
        response.setConnectionId(UUID.randomUUID().toString());
        response.setConnectionToken(UUID.randomUUID().toString().replace("-", "").substring(0, 16));

        response.setAvailableTransports(Arrays.asList(
                new TransportResponse("WebSockets", Arrays.asList("Text", "Binary")),
                new TransportResponse("ServerSentEvents", Arrays.asList("Text")),
                new TransportResponse("LongPolling", Arrays.asList("Text", "Binary"))
        ));

        return ResponseEntity.ok(response);
    }
}