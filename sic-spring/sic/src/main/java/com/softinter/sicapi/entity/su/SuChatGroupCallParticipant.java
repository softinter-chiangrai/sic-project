package com.softinter.sicapi.entity.su;

import com.softinter.sicapi.entity.base.BaseEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "su_chat_group_call_participant")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class SuChatGroupCallParticipant extends BaseEntity {

    @Column(name = "log_id", nullable = false)
    private UUID logId;

    @Column(name = "user_id", nullable = false, length = 100)
    private String userId;
}
