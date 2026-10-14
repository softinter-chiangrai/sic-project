"""
Builds reports-standalone/*.jrxml from reports/*.jrxml.

The templates in reports/ call com.softinter.sicapi.util.ReportHelper (extractContentBlocks / appendText) for every rich-text
field. report-service has no such class, so it cannot compile them. The standalone copies need nothing but Jasper and the JDK:

  * every rich-text list reads its blocks from the SQL function pm_rich_blocks() (migration V20261014090000) through a
    sub dataset that uses the report connection;
  * a picture gets its drawn size exactly like ReportHelper.scaled(): width = the editor's width attribute (else the file's own width),
    never wider than the list; height keeps the ratio; WebP is turned into PNG first. That is done by an inline expression
    (variable imageRenderable of the sub dataset) that returns a Renderable reporting this size, so the image elements stay the
    same RealHeight elements the helper templates use;
  * the logo is embedded in the template.

The same files are copied to report-service/src/main/resources/report-templates/pm_<name>.jrxml (seeded by BundledTemplateSeeder).

Run from sic-spring/sic:  python tools/make_standalone_reports.py
"""
import base64
import re
import sys
import uuid
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "src/main/resources/reports"
DST = ROOT / "src/main/resources/reports-standalone"
SERVICE = ROOT.parent.parent / "report-service/src/main/resources/report-templates"   # copies for report-service, named by the code the backend sends
LOGO = ROOT / "src/main/resources/images/softinter_logo.png"

MAX_WIDTH = "513"     # ReportHelper.MAX_IMAGE_WIDTH, used when the template passes no width


def split_args(expr: str):
    """Split the arguments of a call at top-level commas (respecting (), [], {} and string literals)."""
    args, depth, cur, in_str, esc = [], 0, [], False, False
    for ch in expr:
        if in_str:
            cur.append(ch)
            if esc:
                esc = False
            elif ch == "\\":
                esc = True
            elif ch == '"':
                in_str = False
            continue
        if ch == '"':
            in_str = True
            cur.append(ch)
        elif ch in "([{":
            depth += 1
            cur.append(ch)
        elif ch in ")]}":
            depth -= 1
            cur.append(ch)
        elif ch == "," and depth == 0:
            args.append("".join(cur).strip())
            cur = []
        else:
            cur.append(ch)
    args.append("".join(cur).strip())
    return args


def call_args(expr: str, name: str):
    """Arguments of the call `name(...)` found in expr (balanced parentheses), or None."""
    i = expr.find(name + "(")
    if i < 0:
        return None
    start = i + len(name) + 1
    depth, j, in_str, esc = 1, start, False, False
    while j < len(expr) and depth:
        ch = expr[j]
        if in_str:
            if esc:
                esc = False
            elif ch == "\\":
                esc = True
            elif ch == '"':
                in_str = False
        elif ch == '"':
            in_str = True
        elif ch == "(":
            depth += 1
        elif ch == ")":
            depth -= 1
        j += 1
    return split_args(expr[start:j - 1])


def new_uuid():
    return str(uuid.uuid4())


NL = chr(10)


def dataset_run(html: str, extra: str, fallback: str, max_width: str) -> str:
    return ((
        '<datasetRun uuid="%s" subDataset="RichBlocksDataset">' + NL +
        '						<parameter name="html"><expression><![CDATA[%s]]></expression></parameter>' + NL +
        '						<parameter name="extra"><expression><![CDATA[%s]]></expression></parameter>' + NL +
        '						<parameter name="fallback"><expression><![CDATA[%s]]></expression></parameter>' + NL +
        '						<parameter name="maxWidth"><expression><![CDATA[%s]]></expression></parameter>' + NL +
        '						<connectionExpression><![CDATA[$P{REPORT_CONNECTION}]]></connectionExpression>' + NL +
        '					</datasetRun>') % (new_uuid(), html, extra, fallback, max_width)
    )


# The picture of a block, sized like ReportHelper.scaled(pdfSafe(...)): width = width attribute of the <img> (else the file's width) capped at
# maxWidth, height by ratio, WebP -> PNG; the Renderable reports that size and keeps the original pixels.
IMAGE_RENDERABLE = """((java.util.function.Supplier<net.sf.jasperreports.renderers.Renderable>) () -> {
    if ($F{imageData} == null) return null;
    byte[] src = (byte[]) $F{imageData};
    try {
        if (src.length > 12 && src[0] == 'R' && src[1] == 'I' && src[2] == 'F' && src[3] == 'F' && src[8] == 'W' && src[9] == 'E' && src[10] == 'B' && src[11] == 'P') {
            java.awt.image.BufferedImage webp = javax.imageio.ImageIO.read(new java.io.ByteArrayInputStream(src));
            if (webp != null) {
                java.io.ByteArrayOutputStream bos = new java.io.ByteArrayOutputStream();
                javax.imageio.ImageIO.write(webp, "png", bos);
                src = bos.toByteArray();
            }
        }
        java.awt.image.BufferedImage img = javax.imageio.ImageIO.read(new java.io.ByteArrayInputStream(src));
        final net.sf.jasperreports.renderers.Renderable base = net.sf.jasperreports.renderers.SimpleDataRenderer.getInstance(src);
        if (img == null) return base;
        int w = Math.min($F{imgWidth} != null && $F{imgWidth} > 0 ? $F{imgWidth} : img.getWidth(), $P{maxWidth});
        final java.awt.Dimension size = new java.awt.Dimension(w, Math.max(1, Math.round(img.getHeight() * (float) w / img.getWidth())));
        // no inner class here (Jasper cannot load those from an expression): a proxy answers getDimension and hands everything else to the plain renderer
        return (net.sf.jasperreports.renderers.Renderable) java.lang.reflect.Proxy.newProxyInstance(net.sf.jasperreports.renderers.Renderable.class.getClassLoader(),
            new Class<?>[] {net.sf.jasperreports.renderers.Renderable.class, net.sf.jasperreports.renderers.DataRenderable.class, net.sf.jasperreports.renderers.DimensionRenderable.class},
            (proxy, method, args) -> method.getDeclaringClass() == net.sf.jasperreports.renderers.DimensionRenderable.class ? size : method.invoke(base, args));
    } catch (Exception e) {
        return net.sf.jasperreports.renderers.SimpleDataRenderer.getInstance(src);
    }
}).get()"""

DATASET = """	<!-- Blocks of a rich-text field, computed by the database function pm_rich_blocks (no Java helper needed) -->
	<dataset name="RichBlocksDataset" uuid="%s">
		<parameter name="html" class="java.lang.String"/>
		<parameter name="extra" class="java.lang.String"/>
		<parameter name="fallback" class="java.lang.String"/>
		<parameter name="maxWidth" class="java.lang.Integer"/>
		<query language="sql"><![CDATA[SELECT "text", "imageData", "imgWidth", "align", "tableRow", "cols", c1, c2, c3, c4, c5, c6
            FROM pm_rich_blocks(CAST($P{html} AS text), CAST($P{extra} AS text), CAST($P{fallback} AS text)) ORDER BY seq]]></query>
		<field name="text" class="java.lang.String"/>
		<field name="imageData" class="java.lang.Object"/>
		<field name="imgWidth" class="java.lang.Integer"/>
		<field name="align" class="java.lang.String"/>
		<field name="tableRow" class="java.lang.Boolean"/>
		<field name="cols" class="java.lang.Integer"/>
		<field name="c1" class="java.lang.String"/>
		<field name="c2" class="java.lang.String"/>
		<field name="c3" class="java.lang.String"/>
		<field name="c4" class="java.lang.String"/>
		<field name="c5" class="java.lang.String"/>
		<field name="c6" class="java.lang.String"/>
		<variable name="imageRenderable" class="net.sf.jasperreports.renderers.Renderable">
			<expression><![CDATA[""" + IMAGE_RENDERABLE + """]]></expression>
		</variable>
	</dataset>"""


DATASETRUN = re.compile(
    r'<datasetRun uuid="[^"]*" subDataset="ContentBlocksDataset">\s*<dataSourceExpression><!\[CDATA\[(.*?)\]\]></dataSourceExpression>\s*</datasetRun>',
    re.S,
)

CONTENT_DATASET = re.compile(r'\t<dataset name="ContentBlocksDataset".*?</dataset>', re.S)

LOGO_EXPR = re.compile(r'(<element kind="image"[^>]*scaleImage="RetainShape"[^>]*>\s*<expression><!\[CDATA\[)\(\$P\{logoStream\}.*?(\]\]></expression>)', re.S)


def convert_run(m):
    expr = m.group(1).strip()
    extract = call_args(expr, "com.softinter.sicapi.util.ReportHelper.extractContentBlocks")
    if extract is None:
        raise SystemExit("unknown dataSourceExpression: " + expr[:120])
    html, fallback = extract[0], extract[1]
    max_width = extract[2] if len(extract) > 2 else MAX_WIDTH
    extra = "null"
    ap = call_args(expr, "com.softinter.sicapi.util.ReportHelper.appendText")
    if ap is not None:
        # appendText(<extractContentBlocks(...)>, EXTRA): EXTRA is the last top-level argument
        extra = ap[-1]
    return dataset_run(html, extra, fallback, max_width)


def main():
    DST.mkdir(parents=True, exist_ok=True)
    logo_b64 = base64.b64encode(LOGO.read_bytes()).decode("ascii")
    logo_expr = '(new java.io.ByteArrayInputStream(java.util.Base64.getDecoder().decode("%s")))' % logo_b64
    for f in sorted(SRC.glob("*.jrxml")):
        s = f.read_text(encoding="utf-8")
        s, nruns = DATASETRUN.subn(convert_run, s)
        ntrip = s.count('$F{imageData}')
        s = s.replace('$F{imageData}', '$V{imageRenderable}')   # the image elements draw the sized Renderable of the dataset variable
        s, nds = CONTENT_DATASET.subn(lambda m: DATASET % new_uuid(), s, count=1) if nruns else (s, 0)
        s, nlogo = LOGO_EXPR.subn(lambda m: m.group(1) + logo_expr + m.group(2), s)
        if "ReportHelper" in s:
            raise SystemExit("%s still mentions ReportHelper" % f.name)
        (DST / f.name).write_text(s, encoding="utf-8")
        SERVICE.mkdir(parents=True, exist_ok=True)
        (SERVICE / ("pm_" + f.name)).write_text(s, encoding="utf-8")
        print("%-28s lists=%d picture-sets=%d dataset=%d logo=%d" % (f.name, nruns, ntrip, nds, nlogo))


if __name__ == "__main__":
    sys.exit(main())
