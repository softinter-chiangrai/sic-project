package com.softinter.sicapi.service;

import com.softinter.sicapi.dto.request.SaveProfileRequest;
import com.softinter.sicapi.dto.response.ProfileResponse;

import java.util.UUID;

public interface ProfileService {

    ProfileResponse getProfileByUserId(String userId);

    boolean isProfileComplete(String userId);

    UUID saveProfile(String userId, SaveProfileRequest request);

}