package com.softinter.sicapi.repository.db;

import com.softinter.sicapi.entity.db.DbMailQueue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DbMailQueueRepository extends JpaRepository<DbMailQueue, UUID> {
   List<DbMailQueue> findByStatusAndRetryCountLessThanOrderByCreatedDateAsc(String status, Integer maxRetry);
}
