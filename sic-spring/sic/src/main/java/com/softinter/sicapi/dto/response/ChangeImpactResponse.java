package com.softinter.sicapi.dto.response;

import lombok.Data;
import java.util.UUID;

@Data
public class ChangeImpactResponse {
    private UUID id;
    private String impactedType;
    private UUID impactedId;
    private String impactedTitle;
    private String impactLevel;
}
