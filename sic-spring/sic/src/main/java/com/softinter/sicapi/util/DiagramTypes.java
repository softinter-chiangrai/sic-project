package com.softinter.sicapi.util;

import java.util.Locale;
import java.util.Set;

/**
 * A trace link / scope type that is a diagram: the generic DIAGRAM or any drawing type of a diagram tab
 * (links store the drawing type, e.g. "Sequence" or "Use Case"). Same list as the frontend's
 * core/utils/trace-target.util.ts DIAGRAM_TRACE_TYPES.
 */
public final class DiagramTypes {

    private static final Set<String> TYPES = Set.of(
            "DIAGRAM", "DFD", "ER", "FLOWCHART", "SEQUENCE", "CLASS", "STATE", "GANTT", "MINDMAP",
            "JOURNEY", "PIE", "C4", "USE CASE", "USE_CASE", "USECASE", "TIMELINE", "GIT GRAPH", "GIT_GRAPH", "ARCHITECTURE");

    private DiagramTypes() {
    }

    public static boolean isDiagram(String type) {
        return type != null && TYPES.contains(type.trim().toUpperCase(Locale.ROOT));
    }
}
