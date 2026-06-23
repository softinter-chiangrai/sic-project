package com.softinter.sicapi.service;

import com.softinter.sicapi.entity.su.SuBusiness;
import java.util.UUID;

public interface SuBusinessService {
    SuBusiness findById(UUID id);
}