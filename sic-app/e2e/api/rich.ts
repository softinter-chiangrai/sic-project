import { execFileSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import * as zlib from 'node:zlib';

// Helpers for "does rich text (picture / table typed in the Tiptap editor) really reach the exported PDF?"

/** Solid-colour PNG of an exact size, built by hand so the tests need no image library. */
export function png(width: number, height: number, rgb: [number, number, number] = [200, 30, 30]): Buffer {
  const chunk = (type: string, body: Buffer) => {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(body.length);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(zlib.crc32(Buffer.concat([Buffer.from(type), body])) >>> 0);
    return Buffer.concat([len, Buffer.from(type), body, crc]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // RGB
  const row = Buffer.concat([Buffer.from([0]), Buffer.from(Array.from({ length: width }, () => rgb).flat())]);
  const raw = Buffer.concat(Array.from({ length: height }, () => row));
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}

export type Rich = { html: string; image: string; tokens: { text: string; cells: string[] } };

let seq = 0;
/**
 * HTML shaped like Tiptap output: a paragraph, an inline base64 image, a table whose cells wrap their text in <p>, a closing paragraph.
 * Every call gets a unique image size and unique words, so one document can carry several of them and each can be found on its own.
 */
export function rich(label: string): Rich {
  const n = ++seq;
  const w = 31 + n * 3; // distinct from the logo (421x143) and from every other fixture
  const h = 17 + n * 2;
  const uid = `${label}${Math.random().toString(36).slice(2, 6)}`.replace(/[^A-Za-z0-9]/g, '');
  const text = `Intro${uid}`;
  const cells = [`HeadA${uid}`, `HeadB${uid}`, `CellA${uid}`, `CellB${uid}`];
  const b64 = png(w, h, [(n * 40) % 255, 90, 160]).toString('base64');
  const html =
    `<p>${text}</p>` +
    `<img src="data:image/png;base64,${b64}" alt="e2e" title="e2e">` +
    `<table style="min-width: 50px"><colgroup><col><col></colgroup><tbody>` +
    `<tr><th colspan="1" rowspan="1"><p>${cells[0]}</p></th><th colspan="1" rowspan="1"><p>${cells[1]}</p></th></tr>` +
    `<tr><td colspan="1" rowspan="1"><p>${cells[2]}</p></td><td colspan="1" rowspan="1"><p>${cells[3]}</p></td></tr>` +
    `</tbody></table><p>After${uid}</p>`;
  return { html, image: `${w}x${h}`, tokens: { text, cells } };
}

/** One image as drawn on a page: pixel size, and position/size in points (origin bottom-left, A4 page is 595 x 842, content box x 40..555). */
export type Placed = { page: number; size: string; x: number; y: number; w: number; h: number };
export type Probe = { pageCount: number; images: string[]; placed: Placed[]; text: string };

function openPdfJar(): string {
  if (process.env['OPENPDF_JAR']) return process.env['OPENPDF_JAR'];
  const dir = path.join(os.homedir(), '.m2', 'repository', 'com', 'github', 'librepdf', 'openpdf');
  const versions = fs.readdirSync(dir).sort();
  const v = versions[versions.length - 1];
  return path.join(dir, v, `openpdf-${v}.jar`);
}

/** Embedded images and extracted text of a PDF (tools/PdfProbe.java, built on the OpenPDF jar the backend already uses). */
export function probe(pdf: Buffer): Probe {
  if (pdf.subarray(0, 4).toString() !== '%PDF') throw new Error(`not a PDF: ${pdf.subarray(0, 80).toString()}`);
  const file = path.join(os.tmpdir(), `e2e-${process.pid}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}.pdf`);
  fs.writeFileSync(file, pdf);
  try {
    const out = execFileSync('java', ['-cp', openPdfJar(), path.resolve('e2e/tools/PdfProbe.java'), file], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
    const j = JSON.parse(out.trim().split('\n').pop()!);
    return { pageCount: j.pageCount, images: j.images, placed: j.placed, text: (j.pages as string[]).join('\n') };
  } finally {
    fs.rmSync(file, { force: true });
  }
}

/** Space/newline-insensitive containment (the extractor may break lines inside a cell). */
export const hasText = (text: string, needle: string) => text.replace(/\s+/g, '').includes(needle.replace(/\s+/g, ''));

export const PAGE = { left: 40, right: 555, width: 515, top: 802, bottom: 40 };

/** HTML for one picture with the attributes Tiptap writes: optional width, optional alignment (style or data-align form). */
export function picture(w: number, h: number, opt: { width?: number; align?: 'left' | 'center' | 'right'; form?: 'style' | 'data' } = {}) {
  const b64 = png(w, h, [20, 120, 60]).toString('base64');
  const width = opt.width ? ` width="${opt.width}"` : '';
  const align = opt.align ? (opt.form === 'data' ? ` data-align="${opt.align}"` : ` style="display: block; text-align: ${opt.align}"`) : '';
  return `<img src="data:image/png;base64,${b64}"${width}${align} alt="e2e">`;
}

/** The drawn image whose source pixel size is wxh (before any resize); falls back to the only non-logo image. */
export function drawn(pdf: Probe, size: string): Placed | undefined {
  return pdf.placed.find((p) => p.size === size);
}

export type ImageFormat = 'png' | 'png-alpha' | 'jpg' | 'gif' | 'bmp' | 'webp' | 'svg';
export const MIME: Record<ImageFormat, string> = { png: 'image/png', 'png-alpha': 'image/png', jpg: 'image/jpeg', gif: 'image/gif', bmp: 'image/bmp', webp: 'image/webp', svg: 'image/svg+xml' };

/** base64 of a picture in the given format. jpg / gif / bmp / png-alpha come from tools/ImgGen.java (Node cannot encode them). */
export function imageBase64(format: ImageFormat, w: number, h: number): string {
  if (format === 'png') return png(w, h).toString('base64');
  if (format === 'svg') return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="${w}" height="${h}" fill="#1e5ac8"/></svg>`).toString('base64');
  // smallest valid lossless WebP (1x1): there is no WebP encoder here, so the size cannot be chosen
  if (format === 'webp') return 'UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==';
  const file = path.join(os.tmpdir(), `e2e-img-${process.pid}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}.${format}`);
  try {
    execFileSync('java', [path.resolve('e2e/tools/ImgGen.java'), format, String(w), String(h), file]);
    return fs.readFileSync(file).toString('base64');
  } finally {
    fs.rmSync(file, { force: true });
  }
}

/** <img> in any format, with raw extra attributes (what Tiptap or a paste could put there). */
export function img(format: ImageFormat, w: number, h: number, attrs = ''): string {
  return `<img src="data:${MIME[format]};base64,${imageBase64(format, w, h)}" ${attrs} alt="e2e">`;
}
