package com.softinter.sicapi.service.impl;

import com.softinter.sicapi.dto.response.GlobalSearchResponse;
import com.softinter.sicapi.entity.pm.PmCustomer;
import com.softinter.sicapi.entity.pm.PmCustomerContract;
import com.softinter.sicapi.entity.pm.PmCustomerProject;
import com.softinter.sicapi.repository.pm.PmCustomerContractRepository;
import com.softinter.sicapi.repository.pm.PmCustomerProjectRepository;
import com.softinter.sicapi.repository.pm.PmCustomerRepository;
import com.softinter.sicapi.service.GlobalSearchService;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class GlobalSearchServiceImpl implements GlobalSearchService {

    private final PmCustomerRepository customerRepository;
    private final PmCustomerProjectRepository projectRepository;
    private final PmCustomerContractRepository contractRepository;

    @Override
    public GlobalSearchResponse search(UUID businessId, String keyword, int limit) {
        String kw = keyword == null ? "" : keyword.trim();
        if (kw.isEmpty()) {
            return GlobalSearchResponse.builder()
                    .customers(List.of())
                    .projects(List.of())
                    .contracts(List.of())
                    .build();
        }

        Pageable pageable = PageRequest.of(0, limit);

        List<PmCustomer> customers = customerRepository
                .searchByKeyword(businessId, kw, pageable)
                .getContent();

        List<PmCustomerProject> projects = projectRepository
                .findByBusinessIdAndIsDeleteFalseAndProjectNameContainingIgnoreCase(businessId, kw, pageable)
                .getContent();

        List<PmCustomerContract> contracts = contractRepository
                .findByBusinessIdAndIsDeleteFalseAndContractNoContainingIgnoreCase(businessId, kw, pageable)
                .getContent();

        Map<UUID, PmCustomer> customerById = Stream.concat(
                        customers.stream(),
                        customerRepository.findAllById(
                                Stream.concat(
                                        projects.stream().map(PmCustomerProject::getCustomerId),
                                        contracts.stream().map(PmCustomerContract::getCustomerId)
                                ).filter(java.util.Objects::nonNull).distinct().collect(Collectors.toList())
                        ).stream())
                .collect(Collectors.toMap(PmCustomer::getId, Function.identity(), (a, b) -> a));

        return GlobalSearchResponse.builder()
                .customers(customers.stream()
                        .map(c -> GlobalSearchResponse.CustomerHit.builder()
                                .id(c.getId())
                                .name(nameOf(c))
                                .customerCode(c.getCustomerCode())
                                .build())
                        .collect(Collectors.toList()))
                .projects(projects.stream()
                        .map(p -> GlobalSearchResponse.ProjectHit.builder()
                                .id(p.getId())
                                .projectName(p.getProjectName())
                                .projectCode(p.getProjectCode())
                                .customerId(p.getCustomerId())
                                .customerName(nameOf(customerById.get(p.getCustomerId())))
                                .build())
                        .collect(Collectors.toList()))
                .contracts(contracts.stream()
                        .map(c -> GlobalSearchResponse.ContractHit.builder()
                                .id(c.getId())
                                .contractNo(c.getContractNo())
                                .contractType(c.getContractType())
                                .customerId(c.getCustomerId())
                                .customerName(nameOf(customerById.get(c.getCustomerId())))
                                .projectId(c.getProjectId())
                                .build())
                        .collect(Collectors.toList()))
                .build();
    }

    private String nameOf(PmCustomer customer) {
        if (customer == null) return null;
        return customer.getCompanyNameLocal() != null && !customer.getCompanyNameLocal().isBlank()
                ? customer.getCompanyNameLocal()
                : customer.getCompanyNameEn();
    }
}
