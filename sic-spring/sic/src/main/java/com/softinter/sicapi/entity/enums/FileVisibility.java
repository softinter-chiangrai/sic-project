package com.softinter.sicapi.entity.enums;

import lombok.Getter;
import com.fasterxml.jackson.annotation.JsonCreator;

@Getter
public enum FileVisibility {
    UPLOADER_ONLY(1),
    BUSINESS_ONLY(2),
    ANYONE_WITH_LINK(3),
    PUBLIC(4);

    private final int code;

    FileVisibility(int code) {
        this.code = code;
    }

    public static FileVisibility fromCode(int code) {
        for (FileVisibility v : values()) {
            if (v.code == code) return v;
        }
        return PUBLIC;
    }

    @JsonCreator
    public static FileVisibility fromString(String value) {
        try {
            return FileVisibility.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            try {
                int code = Integer.parseInt(value);
                return fromCode(code);
            } catch (NumberFormatException ex) {
                return PUBLIC;
            }
        }
    }
}