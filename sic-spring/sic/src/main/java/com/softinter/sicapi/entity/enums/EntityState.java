package com.softinter.sicapi.entity.enums;

import lombok.Getter;

@Getter
public enum EntityState {
    DETACHED(0),
    UNCHANGED(1),
    DELETED(2),   
    MODIFIED(3),
    ADDED(4);      

    private final int entityStateCode;

    EntityState(int entityStateCode) {
        this.entityStateCode = entityStateCode;
    }
}