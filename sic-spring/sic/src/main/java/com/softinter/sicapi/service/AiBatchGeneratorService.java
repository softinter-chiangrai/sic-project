package com.softinter.sicapi.service;

import com.softinter.sicapi.dto.request.AiBatchGenerateRequest;
import com.softinter.sicapi.dto.response.AiBatchGenerateResponse;

public interface AiBatchGeneratorService {
    AiBatchGenerateResponse generate(AiBatchGenerateRequest request);
}
