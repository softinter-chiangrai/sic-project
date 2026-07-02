package com.softinter.sicapi.service.impl;

import com.softinter.sicapi.dto.response.ComboboxResponse;
import com.softinter.sicapi.repository.pm.PmCustomerContractRepository;
import com.softinter.sicapi.service.PmCustomerContractService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PmCustomerContractServiceImpl implements PmCustomerContractService {

    private final PmCustomerContractRepository contractRepository;

    @Override
    public List<ComboboxResponse> getComboboxContracts(UUID customerId) {
        return contractRepository.findByCustomerIdAndIsDeleteFalse(customerId)
                .stream()
                .map(c -> new ComboboxResponse(c.getId().toString(), c.getContractNo()))
                .collect(Collectors.toList());
    }
}