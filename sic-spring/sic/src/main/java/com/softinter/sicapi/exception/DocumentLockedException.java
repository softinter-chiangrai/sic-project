package com.softinter.sicapi.exception;

public class DocumentLockedException extends RuntimeException {
    public DocumentLockedException(String message) {
        super(message);
    }
}
