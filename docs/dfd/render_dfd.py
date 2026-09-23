"""Render DFD .mmd sources with Graphviz in a fixed 3-column Gane-Sarson layout.

Mermaid cannot pin node order, so the .mmd files are parsed for nodes/edges only and
laid out here: left = human actors, middle = processes sorted by number (top to bottom),
right = data stores and external systems.

Usage: python render_dfd.py [file.mmd ...]   (no args = every dfd-*.mmd in this folder)
"""
import re
import subprocess
import sys
from pathlib import Path

DOT = r"C:\Program Files\Graphviz\bin\dot.exe"
HERE = Path(__file__).parent
LEFT_ACTORS = ["user", "customer"]
FILL = {
    "entity": ("#FFF2CC", "#D6B656", "1.5"),
    "process": ("#FFE6CC", "#D79B00", "2"),
    "store": ("#F5F5F5", "#666666", "1"),
}

NODE_RE = re.compile(r'^\s*(\w+)\["([^"]*)"\]\s*$')
CLASS_RE = re.compile(r'^\s*class\s+([\w,]+)\s+(\w+)\s*$')
ARROW_RE = re.compile(r'\s*(<-->|-\.->|-->)\s*(?:\|"?([^|"]*)"?\|)?\s*')


def parse(path):
    nodes, classes, edges = {}, {}, []
    for raw in path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("%%") or line.startswith("classDef") or line.startswith("flowchart"):
            continue
        m = CLASS_RE.match(line)
        if m:
            for nid in m.group(1).split(","):
                classes[nid.strip()] = m.group(2)
            continue
        m = NODE_RE.match(line)
        if m:
            nodes[m.group(1)] = m.group(2)
            continue
        parts = ARROW_RE.split(line)
        if len(parts) < 4:
            continue
        # parts = [node, arrow, label, node, arrow, label, node, ...]
        for i in range(0, len(parts) - 3, 3):
            src, arrow, label, dst = parts[i].strip(), parts[i + 1], parts[i + 2], parts[i + 3].strip()
            edges.append((src, dst, arrow, (label or "").strip()))
    return nodes, classes, edges


def proc_key(label):
    head = label.split("<br/>")[0].strip()
    nums = re.findall(r"\d+", head)
    return tuple(int(n) for n in nums) if nums else (999,)


def dot_label(text):
    return text.replace('"', '\\"').replace("<br/>", "\\n")


def merge_pairs(edges):
    """Collapse A->B plus B->A into one two-headed flow so each pair draws a single line."""
    grouped = {}
    for src, dst, arrow, label in edges:
        key = frozenset((src, dst)) if src != dst else (src,)
        grouped.setdefault(key, []).append((src, dst, arrow, label))
    merged = []
    for group in grouped.values():
        first = group[0]
        directions = {(s, d) for s, d, a, _ in group}
        if len(directions) > 1 or any(a == "<-->" for _, _, a, _ in group):
            labels = []
            for _, _, _, lab in group:
                if lab and lab not in labels:
                    labels.append(lab)
            merged.append((first[0], first[1], "<-->", " / ".join(labels)))
        else:
            labels = []
            for _, _, _, lab in group:
                if lab and lab not in labels:
                    labels.append(lab)
            merged.append((first[0], first[1], first[2], " / ".join(labels)))
    return merged


def build_dot(nodes, classes, edges):
    left = [n for n in LEFT_ACTORS if n in nodes]
    middle = sorted(
        [n for n in nodes if classes.get(n) == "process" and not n.endswith("ext")],
        key=lambda n: proc_key(nodes[n]),
    )
    rest = [n for n in nodes if n not in left and n not in middle]
    own_stores = [n for n in rest if classes.get(n) == "store" and not n.endswith("ext")]
    ext_stores = [n for n in rest if classes.get(n) == "store" and n.endswith("ext")]
    ext_procs = [n for n in rest if classes.get(n) == "process"]
    systems = [n for n in rest if n not in own_stores + ext_stores + ext_procs]
    right = ext_procs + own_stores + ext_stores + systems

    out = [
        "digraph DFD {",
        '  rankdir=LR; newrank=true; nodesep=0.6; ranksep=1.9; splines=true; pad=0.2;',
        '  node [shape=box, style="filled", fontname="Tahoma", fontsize=18, margin="0.25,0.14"];',
        '  edge [fontname="Tahoma", fontsize=15, color="#444444", arrowsize=0.8];',
    ]
    for n, label in nodes.items():
        fill, stroke, pen = FILL.get(classes.get(n, "entity"), FILL["entity"])
        out.append(f'  {n} [label="{dot_label(label)}", fillcolor="{fill}", color="{stroke}", penwidth={pen}];')

    for col in (left, middle, right):
        if col:
            out.append("  { rank=same; " + " ".join(f"{n};" for n in col) + " }")
            for a, b in zip(col, col[1:]):
                out.append(f"  {a} -> {b} [style=invis];")
    if left and middle:
        out.append(f"  {left[0]} -> {middle[0]} [style=invis, weight=10];")
    if middle and right:
        out.append(f"  {middle[0]} -> {right[0]} [style=invis, weight=10];")

    for src, dst, arrow, label in merge_pairs(edges):
        if src not in nodes or dst not in nodes:
            continue
        attrs = ["constraint=false"]
        if label:
            attrs.append(f'label="{dot_label(label)}"')
        if arrow == "<-->":
            attrs.append("dir=both")
        if arrow == "-.->":
            attrs.append("style=dashed")
        out.append(f"  {src} -> {dst} [{', '.join(attrs)}];")
    out.append("}")
    return "\n".join(out)


def render(mmd):
    nodes, classes, edges = parse(mmd)
    dot_path = mmd.with_suffix(".dot")
    dot_path.write_text(build_dot(nodes, classes, edges), encoding="utf-8")
    subprocess.run([DOT, "-Tpng", "-Gdpi=150", str(dot_path), "-o", str(mmd.with_suffix(".png"))], check=True)
    subprocess.run([DOT, "-Tsvg", str(dot_path), "-o", str(mmd.with_suffix(".svg"))], check=True)
    print("rendered", mmd.name)


if __name__ == "__main__":
    targets = [Path(p) for p in sys.argv[1:]] or sorted(HERE.glob("dfd-*.mmd"))
    for t in targets:
        render(t)
