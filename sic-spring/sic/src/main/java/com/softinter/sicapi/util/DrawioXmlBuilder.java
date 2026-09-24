package com.softinter.sicapi.util;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * สร้าง XML ของ draw.io (mxGraph) จากโครงสร้างโหนด/เส้นเชื่อมที่ AI ตอบมา พร้อมจัดวางตำแหน่งแบบแบ่งชั้นอัตโนมัติ
 * ใช้เขียนลง PmDiagramTab.graphData.xml ได้ตรงๆ (ผู้ใช้เปิดในหน้า Diagram แล้วแก้ไขต่อได้) โดยไม่ต้อง insert เอง
 *
 * ชื่อ entity ของ ER อยู่บรรทัดแรกของ label (html=0) เพื่อให้ TraceLinkService.createLinksFromDiagramXml อ่านชื่อได้
 */
public final class DrawioXmlBuilder {

    private DrawioXmlBuilder() {
    }

    public record Node(String id, String label, String kind) {
    }

    public record Edge(String from, String to, String label) {
    }

    public record Entity(String name, List<String> attributes) {
    }

    public record Relation(String from, String to, String label, String cardinality) {
    }

    private static final int COL_W = 220;
    private static final int ROW_H = 110;
    private static final int MARGIN = 40;

    /** Flowchart / DFD / Use Case: โหนดชนิดต่างๆ + เส้นเชื่อม */
    public static String graph(List<Node> nodes, List<Edge> edges) {
        Map<String, Node> byId = new LinkedHashMap<>();
        for (Node n : nodes) {
            if (n.id() != null && !n.id().isBlank()) byId.putIfAbsent(n.id(), n);
        }
        List<Edge> validEdges = new ArrayList<>();
        for (Edge e : edges) {
            if (byId.containsKey(e.from()) && byId.containsKey(e.to()) && !e.from().equals(e.to())) validEdges.add(e);
        }

        Map<String, int[]> pos = layered(new ArrayList<>(byId.keySet()), validEdges);
        StringBuilder sb = new StringBuilder();
        int cellNo = 2;
        Map<String, String> cellIds = new HashMap<>();
        for (Node n : byId.values()) {
            String cid = "n" + cellNo++;
            cellIds.put(n.id(), cid);
            int[] p = pos.get(n.id());
            int[] size = sizeOf(n.kind());
            sb.append(vertex(cid, n.label(), styleOf(n.kind()), p[0], p[1] + (ROW_H - size[1]) / 2, size[0], size[1]));
        }
        int edgeNo = 1;
        for (Edge e : validEdges) {
            sb.append(edge("e" + edgeNo++, e.label(), "edgeStyle=orthogonalEdgeStyle;rounded=1;html=1;endArrow=block;endFill=1;",
                    cellIds.get(e.from()), cellIds.get(e.to())));
        }
        return wrap(sb.toString());
    }

    /** ER: entity + attribute แต่ละตัว และความสัมพันธ์พร้อม cardinality (1:1, 1:N, N:M) */
    public static String er(List<Entity> entities, List<Relation> relations) {
        StringBuilder sb = new StringBuilder();
        Map<String, String> cellIds = new HashMap<>();
        int cellNo = 2;
        int cols = Math.max(2, (int) Math.ceil(Math.sqrt(Math.max(1, entities.size()))));
        int i = 0;
        int rowTop = MARGIN;
        int rowMaxH = 0;
        for (Entity en : entities) {
            if (en.name() == null || en.name().isBlank() || cellIds.containsKey(en.name().toLowerCase())) continue;
            int col = i % cols;
            if (col == 0 && i > 0) {
                rowTop += rowMaxH + 60;
                rowMaxH = 0;
            }
            List<String> attrs = en.attributes() == null ? List.of() : en.attributes();
            int h = 40 + 22 * Math.max(1, attrs.size());
            rowMaxH = Math.max(rowMaxH, h);

            StringBuilder label = new StringBuilder(en.name());
            for (String a : attrs) label.append("\n").append(a);

            String cid = "n" + cellNo++;
            cellIds.put(en.name().toLowerCase(), cid);
            sb.append(vertex(cid, label.toString(),
                    "rounded=0;whiteSpace=wrap;html=0;align=left;verticalAlign=top;spacingLeft=10;spacingTop=6;fillColor=#dae8fc;strokeColor=#6c8ebf;fontStyle=0;",
                    MARGIN + col * 300, rowTop, 240, h));
            i++;
        }
        int edgeNo = 1;
        for (Relation r : relations) {
            String s = r.from() == null ? null : cellIds.get(r.from().toLowerCase());
            String t = r.to() == null ? null : cellIds.get(r.to().toLowerCase());
            if (s == null || t == null || s.equals(t)) continue;
            String card = r.cardinality() == null ? "1:N" : r.cardinality().trim().toUpperCase();
            String startArrow = card.startsWith("N") || card.startsWith("M") ? "ERmany" : "ERmandOne";
            String endArrow = card.endsWith("N") || card.endsWith("M") ? "ERmany" : "ERmandOne";
            sb.append(edge("e" + edgeNo++, r.label(),
                    "edgeStyle=entityRelationEdgeStyle;html=1;endArrow=" + endArrow + ";startArrow=" + startArrow + ";endFill=0;startFill=0;",
                    s, t));
        }
        return wrap(sb.toString());
    }

    // ---------------- layout ----------------

    /** แบ่งชั้นตามความลึกของเส้นเชื่อม (longest path, ตัดวงจรด้วยการเดินแบบ DFS) */
    private static Map<String, int[]> layered(List<String> ids, List<Edge> edges) {
        Map<String, List<String>> out = new HashMap<>();
        Map<String, Integer> indeg = new HashMap<>();
        for (String id : ids) {
            out.put(id, new ArrayList<>());
            indeg.put(id, 0);
        }
        for (Edge e : edges) {
            out.get(e.from()).add(e.to());
            indeg.merge(e.to(), 1, Integer::sum);
        }
        Map<String, Integer> layer = new HashMap<>();
        java.util.ArrayDeque<String> queue = new java.util.ArrayDeque<>();
        for (String id : ids) {
            if (indeg.get(id) == 0) {
                layer.put(id, 0);
                queue.add(id);
            }
        }
        if (queue.isEmpty() && !ids.isEmpty()) {
            layer.put(ids.get(0), 0);
            queue.add(ids.get(0));
        }
        int guard = 0;
        while (!queue.isEmpty() && guard++ < 10000) {
            String cur = queue.poll();
            for (String nxt : out.get(cur)) {
                int candidate = layer.get(cur) + 1;
                if (candidate > ids.size()) continue; // กันวงจรวนไม่รู้จบ
                if (!layer.containsKey(nxt) || layer.get(nxt) < candidate) {
                    layer.put(nxt, candidate);
                    queue.add(nxt);
                }
            }
        }
        for (String id : ids) layer.putIfAbsent(id, 0);

        Map<Integer, Integer> countInLayer = new HashMap<>();
        Map<String, int[]> pos = new LinkedHashMap<>();
        for (String id : ids) {
            int l = layer.get(id);
            int idx = countInLayer.merge(l, 1, Integer::sum) - 1;
            pos.put(id, new int[] { MARGIN + l * COL_W, MARGIN + idx * ROW_H });
        }
        return pos;
    }

    private static int[] sizeOf(String kind) {
        return switch (norm(kind)) {
            case "DECISION" -> new int[] { 140, 80 };
            case "START", "END" -> new int[] { 110, 50 };
            case "ACTOR" -> new int[] { 40, 80 };
            case "STORE" -> new int[] { 140, 50 };
            default -> new int[] { 150, 60 };
        };
    }

    private static String styleOf(String kind) {
        return switch (norm(kind)) {
            case "PROCESS", "USECASE" -> "ellipse;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;";
            case "EXTERNAL" -> "rounded=0;whiteSpace=wrap;html=1;fillColor=#fff2cc;strokeColor=#d6b656;";
            case "STORE" -> "shape=partialRectangle;whiteSpace=wrap;html=1;left=0;right=0;fillColor=none;strokeColor=#666666;";
            case "START" -> "ellipse;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;";
            case "END" -> "ellipse;whiteSpace=wrap;html=1;fillColor=#f8cecc;strokeColor=#b85450;";
            case "DECISION" -> "rhombus;whiteSpace=wrap;html=1;fillColor=#ffe6cc;strokeColor=#d79b00;";
            case "ACTOR" -> "shape=umlActor;verticalLabelPosition=bottom;verticalAlign=top;html=1;outlineConnect=0;";
            default -> "rounded=1;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;";
        };
    }

    private static String norm(String kind) {
        return kind == null ? "TASK" : kind.trim().toUpperCase().replace(" ", "").replace("_", "");
    }

    // ---------------- xml ----------------

    private static String vertex(String id, String label, String style, int x, int y, int w, int h) {
        return "<mxCell id=\"" + id + "\" value=\"" + esc(label) + "\" style=\"" + style + "\" vertex=\"1\" parent=\"1\">"
                + "<mxGeometry x=\"" + x + "\" y=\"" + y + "\" width=\"" + w + "\" height=\"" + h + "\" as=\"geometry\"/></mxCell>";
    }

    private static String edge(String id, String label, String style, String source, String target) {
        return "<mxCell id=\"" + id + "\" value=\"" + esc(label) + "\" style=\"" + style + "\" edge=\"1\" parent=\"1\" source=\""
                + source + "\" target=\"" + target + "\"><mxGeometry relative=\"1\" as=\"geometry\"/></mxCell>";
    }

    private static String wrap(String cells) {
        return "<mxfile><diagram id=\"page1\" name=\"Page-1\"><mxGraphModel dx=\"1000\" dy=\"600\" grid=\"1\" gridSize=\"10\" guides=\"1\" "
                + "tooltips=\"1\" connect=\"1\" arrows=\"1\" fold=\"1\" page=\"1\" pageScale=\"1\" pageWidth=\"1600\" pageHeight=\"1200\">"
                + "<root><mxCell id=\"0\"/><mxCell id=\"1\" parent=\"0\"/>" + cells + "</root></mxGraphModel></diagram></mxfile>";
    }

    private static String esc(String s) {
        if (s == null) return "";
        return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\"", "&quot;").replace("\n", "&#xa;");
    }
}
