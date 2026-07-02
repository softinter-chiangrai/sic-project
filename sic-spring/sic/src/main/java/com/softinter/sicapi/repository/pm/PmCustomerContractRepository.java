package com.softinter.sicapi.repository.pm;

import com.softinter.sicapi.entity.pm.PmCustomerContract;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PmCustomerContractRepository
        extends JpaRepository<PmCustomerContract, UUID>,
                JpaSpecificationExecutor<PmCustomerContract> {

    List<PmCustomerContract> findByCustomerIdAndIsDeleteFalse(UUID customerId);
}