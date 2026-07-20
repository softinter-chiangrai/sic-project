// src/main/java/com/softinter/sicapi/service/DiagramSqlService.java
package com.softinter.sicapi.service;

public interface DiagramSqlService {
    String generateSqlFromXml(String xml, String vendor);
    String generateSqlFromXml(String xml);
}