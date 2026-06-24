package com.softinter.sicapi.service;

public interface CurrentUserService {
    String getUserId();
    String getSessionId();
    String getIpAddress();
    String getUsername();
    String getEmail();
}
