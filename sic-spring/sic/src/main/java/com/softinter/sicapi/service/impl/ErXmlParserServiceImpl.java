// src/main/java/com/softinter/sicapi/service/impl/ErXmlParserServiceImpl.java
package com.softinter.sicapi.service.impl;

import org.springframework.stereotype.Service;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;
import org.xml.sax.InputSource;

import javax.xml.parsers.DocumentBuilderFactory;
import java.io.StringReader;
import java.util.*;

@Service
public class ErXmlParserServiceImpl {

    public DatabaseModel parse(String xml) {
        try {
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            Document doc = factory.newDocumentBuilder().parse(new InputSource(new StringReader(xml)));

            // ดึงทุก <mxCell>
            NodeList cells = doc.getElementsByTagName("mxCell");

            Map<String, String> vertexNames = new HashMap<>(); // id -> name
            Map<String, String> vertexDetails = new HashMap<>(); // id -> full text (for columns)
            List<Relation> relations = new ArrayList<>();

            for (int i = 0; i < cells.getLength(); i++) {
                Element cell = (Element) cells.item(i);

                String id = cell.getAttribute("id");
                String value = cell.getAttribute("value");
                String vertex = cell.getAttribute("vertex");
                String edge = cell.getAttribute("edge");
                String source = cell.getAttribute("source");
                String target = cell.getAttribute("target");

                // --- Vertex (Table) ---
                if ("1".equals(vertex) && value != null && !value.trim().isEmpty()) {
                    // value อาจเป็น "Customer" หรือ "Customer\nid: PK\nname: text"
                    vertexNames.put(id, value.trim());
                    vertexDetails.put(id, value.trim());
                }

                // --- Edge (Relation) ---
                if ("1".equals(edge) && source != null && target != null) {
                    String sourceName = vertexNames.get(source);
                    String targetName = vertexNames.get(target);
                    if (sourceName != null && targetName != null) {
                        relations.add(new Relation(sourceName, targetName));
                    }
                }
            }

            // สร้าง Tables จาก vertexDetails
            List<Table> tables = new ArrayList<>();
            for (Map.Entry<String, String> entry : vertexDetails.entrySet()) {
                String fullText = entry.getValue();
                Table table = parseTable(fullText);
                if (table != null) {
                    tables.add(table);
                }
            }

            return new DatabaseModel(tables, relations);

        } catch (Exception e) {
            throw new RuntimeException("Failed to parse ER diagram XML: " + e.getMessage(), e);
        }
    }

    private Table parseTable(String fullText) {
        if (fullText == null || fullText.trim().isEmpty()) return null;

        String[] lines = fullText.split("\n");
        if (lines.length == 0) return null;

        String tableName = lines[0].trim();
        if (tableName.isEmpty()) return null;

        List<Column> columns = new ArrayList<>();

        // เริ่มจากบรรทัดที่ 2 เป็นต้นไป
        for (int i = 1; i < lines.length; i++) {
            String line = lines[i].trim();
            if (line.isEmpty()) continue;

            // รูปแบบ: "id : PK" หรือ "name : varchar" หรือ "created_at : timestamp"
            // หรือ "id PK" หรือ "id(PK)"
            Column col = parseColumn(line);
            if (col != null) {
                columns.add(col);
            }
        }

        // ถ้าไม่มี columns ให้ถือว่าเป็น Entity เดี่ยว ๆ (อาจเกิดจาก Table ที่ยังไม่ใส่ Columns)
        // แต่เรายังเก็บไว้
        return new Table(tableName, columns);
    }

    private Column parseColumn(String line) {
        // 1. ตรวจสอบรูปแบบ "name : type (PK)" หรือ "name : type"
        String[] parts = line.split(":");
        if (parts.length >= 2) {
            String name = parts[0].trim();
            String typeAndFlags = parts[1].trim();

            boolean isPk = typeAndFlags.toUpperCase().contains("PK") || typeAndFlags.toUpperCase().contains("PRIMARY KEY");
            // ลบคำว่า PK / PRIMARY KEY ออกจาก type
            String type = typeAndFlags.replaceAll("(?i)\\b(PK|PRIMARY KEY)\\b", "").trim();
            if (type.isEmpty()) type = "TEXT"; // fallback

            return new Column(name, type, isPk);
        }

        // 2. รูปแบบ "id PK" หรือ "name TEXT"
        String[] simpleParts = line.split("\\s+");
        if (simpleParts.length >= 2) {
            String name = simpleParts[0];
            String typeOrFlag = simpleParts[1].toUpperCase();
            boolean isPk = "PK".equals(typeOrFlag) || "PRIMARY".equals(typeOrFlag);
            String type = isPk ? "TEXT" : typeOrFlag; // fallback
            return new Column(name, type, isPk);
        }

        // 3. ถ้าเป็นแค่ชื่อ column (ไม่มี type) -> ใช้ TEXT
        if (!line.trim().isEmpty()) {
            return new Column(line.trim(), "TEXT", false);
        }

        return null;
    }

    // === Inner Models ===
    public static class DatabaseModel {
        public List<Table> tables;
        public List<Relation> relations;

        public DatabaseModel(List<Table> tables, List<Relation> relations) {
            this.tables = tables != null ? tables : new ArrayList<>();
            this.relations = relations != null ? relations : new ArrayList<>();
        }
    }

    public static class Table {
        public String name;
        public List<Column> columns;

        public Table(String name, List<Column> columns) {
            this.name = name;
            this.columns = columns != null ? columns : new ArrayList<>();
        }
    }

    public static class Column {
        public String name;
        public String type;
        public boolean isPrimaryKey;

        public Column(String name, String type, boolean isPrimaryKey) {
            this.name = name;
            this.type = type;
            this.isPrimaryKey = isPrimaryKey;
        }
    }

    public static class Relation {
        public String from;
        public String to;

        public Relation(String from, String to) {
            this.from = from;
            this.to = to;
        }
    }
}