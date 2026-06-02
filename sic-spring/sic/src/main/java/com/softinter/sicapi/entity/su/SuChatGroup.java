package com.softinter.sicapi.entity.su;

import com.softinter.sicapi.entity.base.BaseBusinessEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "su_chat_group")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class SuChatGroup extends BaseBusinessEntity {

    @Column(name = "name", nullable = false, length = 200)
    private String name;

    @OneToMany(mappedBy = "group", fetch = FetchType.LAZY)
    private List<SuChatGroupMember> members = new ArrayList<>();

    @OneToMany(mappedBy = "group", fetch = FetchType.LAZY)
    private List<SuChatGroupLog> messages = new ArrayList<>();
}
