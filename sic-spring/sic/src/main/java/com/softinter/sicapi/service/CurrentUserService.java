package com.softinter.sicapi.service;

import java.util.UUID;

public interface CurrentUserService {
    UUID getBusinessId();
    String getUserId();
    String getSessionId();
    String getIpAddress();
    String getUsername();
    String getEmail();
}
