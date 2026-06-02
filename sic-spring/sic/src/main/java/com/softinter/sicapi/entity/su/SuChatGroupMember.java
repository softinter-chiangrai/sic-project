package com.softinter.sicapi.entity.su;

import com.softinter.sicapi.entity.base.BaseBusinessEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "su_chat_group_member")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class SuChatGroupMember extends BaseBusinessEntity {

    @Column(name = "group_id", insertable = false, updatable = false)
    private UUID groupId;

    @Column(name = "user_id", nullable = false, length = 100)
    private String userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id", nullable = false)
    private SuChatGroup group;

    
}
