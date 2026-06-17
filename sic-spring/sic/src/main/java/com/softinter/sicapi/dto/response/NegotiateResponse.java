package com.softinter.sicapi.dto.response;

import java.util.List;

import lombok.Data;

@Data
public class NegotiateResponse {
    private int negotiateVersion;
    private String connectionId;
    private String connectionToken;
    private List<TransportResponse> availableTransports;
}