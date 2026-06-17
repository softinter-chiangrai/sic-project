package com.softinter.sicapi.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.List;

@Data
@AllArgsConstructor
public class TransportResponse {
    private String transport;
    private List<String> transferFormats;
}