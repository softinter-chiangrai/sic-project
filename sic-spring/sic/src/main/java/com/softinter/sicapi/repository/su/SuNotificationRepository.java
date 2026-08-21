package com.softinter.sicapi.repository.su;

import com.softinter.sicapi.entity.su.SuNotification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SuNotificationRepository extends JpaRepository<SuNotification, UUID> {

    @Query("SELECT n FROM SuNotification n WHERE n.recipientUserId = :recipientUserId AND n.isDelete = false ORDER BY n.createdDate DESC")
    List<SuNotification> findByRecipientUserIdOrderByCreatedDateDesc(@Param("recipientUserId") String recipientUserId);

    @Query("SELECT n FROM SuNotification n WHERE n.recipientUserId = :recipientUserId AND n.isDelete = false")
    org.springframework.data.domain.Page<SuNotification> findByRecipientUserIdAndIsDeleteFalse(@Param("recipientUserId") String recipientUserId, org.springframework.data.domain.Pageable pageable);

    @Query("SELECT n FROM SuNotification n WHERE n.recipientUserId = :recipientUserId AND n.isRead = false AND n.isDelete = false")
    org.springframework.data.domain.Page<SuNotification> findByRecipientUserIdAndIsReadFalseAndIsDeleteFalse(@Param("recipientUserId") String recipientUserId, org.springframework.data.domain.Pageable pageable);

    @Query("SELECT COUNT(n) FROM SuNotification n WHERE n.recipientUserId = :recipientUserId AND n.isRead = false AND n.isDelete = false")
    long countUnreadByRecipientUserId(@Param("recipientUserId") String recipientUserId);

    @Modifying
    @Query("UPDATE SuNotification n SET n.isRead = true WHERE n.recipientUserId = :recipientUserId AND n.isRead = false")
    int markAllAsReadForUser(@Param("recipientUserId") String recipientUserId);
}
