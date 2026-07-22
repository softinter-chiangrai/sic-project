package com.softinter.sicapi.repository.pm;

import com.softinter.sicapi.entity.pm.PmTestScenario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface PmTestScenarioRepository extends JpaRepository<PmTestScenario, UUID> {
}