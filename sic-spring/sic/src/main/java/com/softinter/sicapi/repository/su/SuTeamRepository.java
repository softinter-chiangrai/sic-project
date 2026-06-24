package com.softinter.sicapi.repository.su;

import com.softinter.sicapi.entity.su.SuTeam;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SuTeamRepository extends JpaRepository<SuTeam, UUID> {

    // ✅ หาทีมของบริษัท (บริษัทละ 1 ทีม)
    List<SuTeam> findByBusinessIdAndIsActiveTrue(UUID businessId);

    Optional<SuTeam> findByBusinessIdAndTeamCode(UUID businessId, String teamCode);

    

}