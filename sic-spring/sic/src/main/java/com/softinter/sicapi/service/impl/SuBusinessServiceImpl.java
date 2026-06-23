package com.softinter.sicapi.service.impl;

import java.util.UUID;

import org.springframework.stereotype.Service;

import com.softinter.sicapi.entity.su.SuBusiness;
import com.softinter.sicapi.repository.su.SuBusinessRepository;
import com.softinter.sicapi.service.SuBusinessService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SuBusinessServiceImpl implements SuBusinessService {
    private final SuBusinessRepository businessRepository;

    @Override
    public SuBusiness findById(UUID id) {
        return businessRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Business not found"));
    }
}