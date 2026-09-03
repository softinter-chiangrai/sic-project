package com.softinter.sicapi.repository.pm;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.softinter.sicapi.entity.pm.PmMaTicketAssignee;

public interface PmMaTicketAssigneeRepository extends JpaRepository<PmMaTicketAssignee, UUID> {
    List<PmMaTicketAssignee> findByMaTicketId(UUID maTicketId);
    void deleteByMaTicketId(UUID maTicketId);
}
