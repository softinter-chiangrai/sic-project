package com.softinter.sicapi.service;

import java.util.List;
import java.util.UUID;

import com.softinter.sicapi.dto.response.ComboboxResponse;

public interface PmCustomerContractService {
    List<ComboboxResponse> getComboboxContracts(UUID customerId);
}