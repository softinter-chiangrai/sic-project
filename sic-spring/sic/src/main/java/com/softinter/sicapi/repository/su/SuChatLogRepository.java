package com.softinter.sicapi.repository.su;

import com.softinter.sicapi.entity.su.SuChatLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SuChatLogRepository extends JpaRepository<SuChatLog, UUID> {

   
    @Query("SELECT c FROM SuChatLog c WHERE " +
           "((c.senderId = :userId1 AND c.receiverId = :userId2) OR (c.senderId = :userId2 AND c.receiverId = :userId1)) " +
           "AND c.isDelete = false ORDER BY c.createdDate")
    List<SuChatLog> findChatHistory(@Param("userId1") String userId1, @Param("userId2") String userId2);

   
    @Query("SELECT c FROM SuChatLog c WHERE c.receiverId = :userId AND c.isRead = false AND c.isDelete = false")
    List<SuChatLog> findUnreadMessages(@Param("userId") String userId);

    @Modifying
    @Query("UPDATE SuChatLog c SET c.isRead = true WHERE c.senderId = :senderId AND c.receiverId = :receiverId AND c.isRead = false")
    int markAsRead(@Param("senderId") String senderId, @Param("receiverId") String receiverId);
}
