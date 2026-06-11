package com.softinter.sicapi.util;

import java.io.IOException;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.softinter.sicapi.entity.enums.FileVisibility;

public class FileVisibilityDeserializer extends JsonDeserializer<FileVisibility> {
    @Override
    public FileVisibility deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
        String value = p.getText();
        return FileVisibilityConverter.fromString(value);
    }
}