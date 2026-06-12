package com.softinter.sicapi.repository.su;

import com.softinter.sicapi.entity.su.SuChatGroupMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SuChatGroupMemberRepository extends JpaRepository<SuChatGroupMember, UUID> {
    List<SuChatGroupMember> findByGroupIdAndIsDeleteFalse(UUID groupId);
}
