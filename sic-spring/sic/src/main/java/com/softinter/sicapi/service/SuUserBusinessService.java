package com.softinter.sicapi.service;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import com.softinter.sicapi.dto.request.SaveUserBusinessRequest;
import com.softinter.sicapi.dto.response.UserBusinessResponse;
import com.softinter.sicapi.dto.response.UserResponse;
import com.softinter.sicapi.entity.su.SuUserBusiness;

public interface SuUserBusinessService {
    List<UserBusinessResponse> findAll(String userId);
    Page<UserBusinessResponse> findAll(Specification<SuUserBusiness> spec, Pageable pageable);
    SuUserBusiness findById(UUID id);
    UserBusinessResponse getResponseById(UUID id);
    UUID save(SaveUserBusinessRequest request);
    void delete(UUID id);
    List<UserBusinessResponse> findByUserId(String userId);
    List<UserResponse> getAvailableUsers();
}