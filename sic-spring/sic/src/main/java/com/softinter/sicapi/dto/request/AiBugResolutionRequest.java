package com.softinter.sicapi.dto.request;

import java.util.UUID;
import lombok.Data;

@Data
public class AiBugResolutionRequest {
    private UUID bugId;
    private String title;
    private String description;
    private String stepsToReproduce;
    private String environment;
    private String lang; // 'th' or 'en'
    private String model;
}
