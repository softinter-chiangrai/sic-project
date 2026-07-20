// src/main/java/com/softinter/sicapi/service/impl/DiagramSqlServiceImpl.java
package com.softinter.sicapi.service.impl;

import com.softinter.sicapi.service.DiagramSqlService;
import com.softinter.sicapi.service.impl.ErXmlParserServiceImpl.DatabaseModel;
import com.softinter.sicapi.service.impl.ErXmlParserServiceImpl.Table;
import com.softinter.sicapi.service.impl.ErXmlParserServiceImpl.Column;
import com.softinter.sicapi.service.impl.ErXmlParserServiceImpl.Relation;

import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

@Service
public class DiagramSqlServiceImpl implements DiagramSqlService {

    @Override
    public String generateSqlFromXml(String xml ) {
        // ค่าเริ่มต้นเป็น PostgreSQL เพื่อ backward compatibility
        return generateSqlFromXml(xml, "postgresql");
    }

    @Override
    public String generateSqlFromXml(String xml, String vendor) {
        // 1. แปลง XML → Database Model
        ErXmlParserServiceImpl parser = new ErXmlParserServiceImpl();
        DatabaseModel model = parser.parse(xml);

        // 2. แปลง Database Model → SQL ตาม vendor
        return generate(model, vendor);
    }

    public String generate(DatabaseModel model, String vendor) {
        StringBuilder sql = new StringBuilder();
        sql.append("-- ============================================================\n");
        sql.append("-- Generated SQL from ER Diagram (").append(vendor).append(")\n");
        sql.append("-- Generated at: ").append(Instant.now()).append("\n");
        sql.append("-- ============================================================\n\n");

        // 1. สร้าง Table
        for (Table table : model.tables) {
            sql.append(generateCreateTable(table, vendor));
            sql.append("\n\n");
        }

        // 2. สร้าง Foreign Key (ถ้ามี)
        Set<String> createdFks = new HashSet<>();
        for (Relation rel : model.relations) {
            String fromTable = rel.from;
            String toTable = rel.to;
            String fkName = "fk_" + fromTable + "_" + toTable;
            if (createdFks.contains(fkName)) continue;
            createdFks.add(fkName);

            String fkColumn = toTable.toLowerCase() + "_id";
            
            sql.append("-- Relation: ").append(fromTable).append(" -> ").append(toTable).append("\n");
            
            if ("mysql".equalsIgnoreCase(vendor)) {
                // MySQL: ADD COLUMN (ไม่มี IF NOT EXISTS) และ FOREIGN KEY syntax
                sql.append("ALTER TABLE ").append(fromTable)
                   .append(" ADD COLUMN ").append(fkColumn).append(" CHAR(36);\n");
                sql.append("ALTER TABLE ").append(fromTable)
                   .append(" ADD CONSTRAINT ").append(fkName)
                   .append(" FOREIGN KEY (").append(fkColumn).append(") REFERENCES ").append(toTable).append("(id);\n\n");
            } else {
                // PostgreSQL (default)
                sql.append("ALTER TABLE ").append(fromTable)
                   .append(" ADD COLUMN IF NOT EXISTS ").append(fkColumn).append(" UUID;\n");
                sql.append("ALTER TABLE ").append(fromTable)
                   .append(" ADD CONSTRAINT ").append(fkName)
                   .append(" FOREIGN KEY (").append(fkColumn).append(") REFERENCES ").append(toTable).append("(id);\n\n");
            }
        }

        return sql.toString();
    }

    private String generateCreateTable(Table table, String vendor) {
        StringBuilder sb = new StringBuilder();
        sb.append("CREATE TABLE IF NOT EXISTS ").append(table.name).append(" (\n");

        boolean hasPk = false;
        for (Column col : table.columns) {
            String colType = mapType(col.type, vendor);
            sb.append("    ").append(col.name).append(" ").append(colType);
            if (col.isPrimaryKey) {
                sb.append(getPrimaryKeySyntax(vendor));
                hasPk = true;
            }
            sb.append(",\n");
        }

        // ถ้ายังไม่มี PK, เพิ่ม id
        if (!hasPk) {
            sb.append("    id ").append(getPrimaryKeySyntax(vendor)).append(",\n");
        }

        // ตัดคอมมา(,) ตัวสุดท้ายออก
        String sql = sb.toString();
        if (sql.endsWith(",\n")) {
            sql = sql.substring(0, sql.length() - 2) + "\n";
        }

        sql += ");";
        return sql;
    }

    private String getPrimaryKeySyntax(String vendor) {
        if ("mysql".equalsIgnoreCase(vendor)) {
            return "CHAR(36) PRIMARY KEY"; // MySQL ใช้ UUID แบบ CHAR(36) หรือจะใช้ BINARY(16) ก็ได้
            // หรือจะใช้ AUTO_INCREMENT แทนก็ได้ แต่เราใช้ UUID เป็น PK เพื่อความสอดคล้อง
        } else {
            // PostgreSQL default
            return "UUID DEFAULT gen_random_uuid() PRIMARY KEY";
        }
    }

    private String mapType(String type, String vendor) {
        if (type == null) return "TEXT";
        String upper = type.toUpperCase();

        if ("mysql".equalsIgnoreCase(vendor)) {
            return switch (upper) {
                case "INT", "INTEGER" -> "INT";
                case "BIGINT" -> "BIGINT";
                case "SMALLINT" -> "SMALLINT";
                case "VARCHAR", "STRING", "CHAR" -> "VARCHAR(255)";
                case "TEXT", "LONGTEXT" -> "TEXT";
                case "BOOL", "BOOLEAN" -> "TINYINT(1)";
                case "DATE" -> "DATE";
                case "DATETIME", "TIMESTAMP" -> "DATETIME";
                case "DECIMAL", "NUMERIC" -> "DECIMAL(19,2)";
                case "FLOAT", "DOUBLE" -> "DOUBLE";
                default -> "VARCHAR(255)";
            };
        } else {
            // PostgreSQL (default)
            return switch (upper) {
                case "INT", "INTEGER", "BIGINT", "SMALLINT" -> upper;
                case "VARCHAR", "STRING", "CHAR" -> "VARCHAR(255)";
                case "TEXT", "LONGTEXT" -> "TEXT";
                case "BOOL", "BOOLEAN" -> "BOOLEAN";
                case "DATE" -> "DATE";
                case "DATETIME", "TIMESTAMP" -> "TIMESTAMPTZ";
                case "DECIMAL", "NUMERIC" -> "NUMERIC(19,2)";
                case "FLOAT", "DOUBLE" -> "DOUBLE PRECISION";
                default -> "TEXT";
            };
        }
    }
}