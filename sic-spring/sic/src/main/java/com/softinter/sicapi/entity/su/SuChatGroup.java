package com.softinter.sicapi.entity.su;

import com.softinter.sicapi.entity.base.BaseBusinessEntity;
import com.softinter.sicapi.entity.base.BaseNoUserEntity;

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
public class SuChatGroup extends BaseNoUserEntity {

    @Column(name = "name", nullable = false, length = 200)
    private String name;

    @Column(name = "group_name", nullable = false, length = 200)  
    private String groupName;
    
    @Column(name = "group_description", length = 500)  
    private String groupDescription;

    @OneToMany(mappedBy = "group", fetch = FetchType.LAZY)
    private List<SuChatGroupMember> members = new ArrayList<>();

    @OneToMany(mappedBy = "group", fetch = FetchType.LAZY)
    private List<SuChatGroupLog> messages = new ArrayList<>();
}
