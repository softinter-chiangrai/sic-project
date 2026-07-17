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
    public String generateSqlFromXml(String xml) {
        // 1. แปลง XML → Database Model
        ErXmlParserServiceImpl parser = new ErXmlParserServiceImpl();
        DatabaseModel model = parser.parse(xml);

        // 2. แปลง Database Model → SQL
        return generate(model);
    }

    public String generate(DatabaseModel model) {
        StringBuilder sql = new StringBuilder();
        sql.append("-- ============================================================\n");
        sql.append("-- Generated SQL from ER Diagram (PostgreSQL)\n");
        sql.append("-- Generated at: ").append(Instant.now()).append("\n");
        sql.append("-- ============================================================\n\n");

        // 1. สร้าง Table
        for (Table table : model.tables) {
            sql.append(generateCreateTable(table));
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

            // สร้าง FK: ALTER TABLE fromTable ADD CONSTRAINT fk_... FOREIGN KEY (toTable_id) REFERENCES toTable(id);
            // แต่เราไม่รู้ว่าคอลัมน์ไหนเป็น FK -> ใช้ fallback เป็น toTable + "_id"
            String fkColumn = toTable.toLowerCase() + "_id";
            
            sql.append("-- Relation: ").append(fromTable).append(" -> ").append(toTable).append("\n");
            sql.append("ALTER TABLE ").append(fromTable)
               .append(" ADD COLUMN IF NOT EXISTS ").append(fkColumn).append(" UUID;\n");
            sql.append("ALTER TABLE ").append(fromTable)
               .append(" ADD CONSTRAINT ").append(fkName)
               .append(" FOREIGN KEY (").append(fkColumn).append(") REFERENCES ").append(toTable).append("(id);\n\n");
        }

        return sql.toString();
    }

    private String generateCreateTable(Table table) {
        StringBuilder sb = new StringBuilder();
        sb.append("CREATE TABLE IF NOT EXISTS ").append(table.name).append(" (\n");

        boolean hasPk = false;
        for (Column col : table.columns) {
            String colType = mapToPostgresType(col.type);
            sb.append("    ").append(col.name).append(" ").append(colType);
            if (col.isPrimaryKey) {
                sb.append(" PRIMARY KEY");
                hasPk = true;
            }
            sb.append(",\n");
        }

        // ถ้ายังไม่มี PK, เพิ่ม id UUID DEFAULT gen_random_uuid()
        if (!hasPk) {
            sb.append("    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,\n");
        }

        // ตัดคอมมา(,) ตัวสุดท้ายออก
        String sql = sb.toString();
        if (sql.endsWith(",\n")) {
            sql = sql.substring(0, sql.length() - 2) + "\n";
        }

        sql += ");";
        return sql;
    }

    private String mapToPostgresType(String type) {
        if (type == null) return "TEXT";
        String upper = type.toUpperCase();
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