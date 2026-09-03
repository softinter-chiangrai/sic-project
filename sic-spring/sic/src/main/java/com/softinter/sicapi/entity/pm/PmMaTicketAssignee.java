package com.softinter.sicapi.entity.pm;

import com.softinter.sicapi.entity.base.BaseBusinessEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "pm_ma_ticket_assignee")
@Data
@EqualsAndHashCode(callSuper = true)
public class PmMaTicketAssignee extends BaseBusinessEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ma_ticket_id", nullable = false)
    private PmMaTicket maTicket;

    @Column(name = "user_id", nullable = false, length = 100)
    private String userId;
}
