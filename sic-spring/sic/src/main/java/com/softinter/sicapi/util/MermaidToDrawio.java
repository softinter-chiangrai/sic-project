package com.softinter.sicapi.util;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import com.softinter.sicapi.util.DrawioXmlBuilder.Edge;
import com.softinter.sicapi.util.DrawioXmlBuilder.Entity;
import com.softinter.sicapi.util.DrawioXmlBuilder.Node;
import com.softinter.sicapi.util.DrawioXmlBuilder.Relation;

/**
 * แปลง Mermaid (flowchart/graph และ erDiagram) เป็น XML ของ draw.io ด้วย parser ของเราเอง (ไม่ต้องเรียก AI ซ้ำ)
 * ตัวแปลง Mermaid ในตัว draw.io เรียกจากภายนอก iframe ไม่ได้ จึงทำแบบ best-effort สำหรับไวยากรณ์ที่ใช้บ่อย
 * ชนิดอื่น (sequence, class, state ฯลฯ) จะโยน IllegalArgumentException ให้ผู้ใช้ไปใช้ Insert > Mermaid ของ draw.io เอง
 */
public final class MermaidToDrawio {

    private MermaidToDrawio() {
    }

    public record Result(String type, String xml) {
    }

    private static final String NODE_SHAPE =
            "(\\(\\(.*?\\)\\)|\\(\\[.*?\\]\\)|\\[\\(.*?\\)\\]|\\[\\[.*?\\]\\]|\\[.*?\\]|\\(.*?\\)|\\{.*?\\})";
    private static final Pattern NODE = Pattern.compile("\\s*([A-Za-z_][\\w-]*)" + NODE_SHAPE + "?");
    private static final Pattern ARROW = Pattern.compile(
            "\\s*(?:--\\s+([^>|]+?)\\s+-->|(?:-->|---|-\\.->|-\\.-|==>|===|--[xo]))(?:\\s*\\|([^|]*)\\|)?");

    private static final Pattern ER_REL = Pattern.compile(
            "^\\s*([\\w-]+)\\s+([|o}{]{1,2}(?:--|\\.\\.)[|o}{]{1,2})\\s+([\\w-]+)\\s*(?::\\s*(.*))?$");
    private static final Pattern ER_BLOCK_START = Pattern.compile("^\\s*([\\w-]+)\\s*\\{\\s*$");

    public static Result convert(String mermaid) {
        if (mermaid == null || mermaid.isBlank()) {
            throw new IllegalArgumentException("ไม่มีโค้ด Mermaid");
        }
        List<String> lines = new ArrayList<>();
        for (String raw : mermaid.replace("\r", "").split("\n")) {
            String line = raw.strip();
            if (!line.isEmpty() && !line.startsWith("%%")) lines.add(line);
        }
        if (lines.isEmpty()) throw new IllegalArgumentException("ไม่มีโค้ด Mermaid");

        String header = lines.get(0).toLowerCase();
        if (header.startsWith("graph") || header.startsWith("flowchart")) {
            return new Result("Flowchart", flowchart(lines.subList(1, lines.size())));
        }
        if (header.startsWith("erdiagram")) {
            return new Result("ER", er(lines.subList(1, lines.size())));
        }
        throw new IllegalArgumentException("ยังรองรับเฉพาะ Mermaid แบบ flowchart/graph และ erDiagram (ชนิดอื่นให้ใช้ Insert > Mermaid ใน draw.io)");
    }

    // ---------------- flowchart ----------------

    private static String flowchart(List<String> lines) {
        Map<String, Node> nodes = new LinkedHashMap<>();
        List<Edge> edges = new ArrayList<>();

        for (String line : lines) {
            String lower = line.toLowerCase();
            if (lower.startsWith("subgraph") || lower.equals("end") || lower.startsWith("classdef") || lower.startsWith("class ")
                    || lower.startsWith("style ") || lower.startsWith("linkstyle") || lower.startsWith("click ") || lower.startsWith("direction")) {
                continue;
            }
            for (String stmt : line.split(";")) {
                parseChain(stmt, nodes, edges);
            }
        }
        if (nodes.isEmpty()) throw new IllegalArgumentException("อ่านโหนดจาก Mermaid ไม่ได้");
        return DrawioXmlBuilder.graph(new ArrayList<>(nodes.values()), edges);
    }

    private static void parseChain(String stmt, Map<String, Node> nodes, List<Edge> edges) {
        int pos = 0;
        String prev = null;
        String pendingLabel = null;
        while (pos < stmt.length()) {
            Matcher nm = NODE.matcher(stmt);
            nm.region(pos, stmt.length());
            if (!nm.lookingAt()) return;
            String id = nm.group(1);
            String shape = nm.group(2);
            registerNode(nodes, id, shape);
            if (prev != null) edges.add(new Edge(prev, id, pendingLabel == null ? "" : pendingLabel));
            prev = id;
            pos = nm.end();

            Matcher am = ARROW.matcher(stmt);
            am.region(pos, stmt.length());
            if (!am.lookingAt()) return;
            pendingLabel = clean(am.group(1) != null ? am.group(1) : am.group(2));
            pos = am.end();
        }
    }

    private static void registerNode(Map<String, Node> nodes, String id, String shape) {
        String label = id;
        String kind = "TASK";
        if (shape != null) {
            if (shape.startsWith("{")) {
                kind = "DECISION";
                label = shape.substring(1, shape.length() - 1);
            } else if (shape.startsWith("((")) {
                kind = "PROCESS";
                label = shape.substring(2, shape.length() - 2);
            } else if (shape.startsWith("([")) {
                kind = "START";
                label = shape.substring(2, shape.length() - 2);
            } else if (shape.startsWith("[(")) {
                kind = "STORE";
                label = shape.substring(2, shape.length() - 2);
            } else if (shape.startsWith("[[")) {
                label = shape.substring(2, shape.length() - 2);
            } else {
                label = shape.substring(1, shape.length() - 1);
            }
        }
        Node existing = nodes.get(id);
        if (existing == null || (shape != null && existing.label().equals(id))) {
            nodes.put(id, new Node(id, clean(label), kind));
        }
    }

    private static String clean(String s) {
        if (s == null) return "";
        String v = s.strip();
        if (v.length() >= 2 && v.startsWith("\"") && v.endsWith("\"")) v = v.substring(1, v.length() - 1);
        return v.replace("<br/>", "\n").replace("<br>", "\n").replace("<br />", "\n");
    }

    // ---------------- erDiagram ----------------

    private static String er(List<String> lines) {
        Map<String, List<String>> attrs = new LinkedHashMap<>();
        List<Relation> rels = new ArrayList<>();

        for (int i = 0; i < lines.size(); i++) {
            String line = lines.get(i);
            Matcher bm = ER_BLOCK_START.matcher(line);
            if (bm.matches()) {
                String name = bm.group(1);
                List<String> list = attrs.computeIfAbsent(name, k -> new ArrayList<>());
                i++;
                while (i < lines.size() && !lines.get(i).startsWith("}")) {
                    list.add(lines.get(i).replaceAll("\\s+", " "));
                    i++;
                }
                continue;
            }
            Matcher rm = ER_REL.matcher(line);
            if (rm.matches()) {
                attrs.computeIfAbsent(rm.group(1), k -> new ArrayList<>());
                attrs.computeIfAbsent(rm.group(3), k -> new ArrayList<>());
                String token = rm.group(2);
                int sep = token.contains("--") ? token.indexOf("--") : token.indexOf("..");
                String left = token.substring(0, sep);
                String right = token.substring(sep + 2);
                String card = (isMany(left) ? "N" : "1") + ":" + (isMany(right) ? "N" : "1");
                rels.add(new Relation(rm.group(1), rm.group(3), clean(rm.group(4)), card));
            }
        }
        if (attrs.isEmpty()) throw new IllegalArgumentException("อ่าน entity จาก Mermaid ไม่ได้");
        List<Entity> entities = new ArrayList<>();
        attrs.forEach((name, list) -> entities.add(new Entity(name, list)));
        return DrawioXmlBuilder.er(entities, rels);
    }

    private static boolean isMany(String symbol) {
        return symbol.contains("{") || symbol.contains("}");
    }
}
