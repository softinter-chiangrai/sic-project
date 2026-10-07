/**
 * แปลง snapshot (JSON ของเอกสาร ณ เวอร์ชันนั้น) เป็นรายการ field พร้อมแสดงผล
 * ไม่ผูกกับชนิดเอกสาร: ใช้ได้กับทุก DocumentType โดยไล่ทุก key ใน snapshot
 */
export type FieldKind = 'text' | 'longtext' | 'html' | 'bool' | 'chips' | 'table';

export interface SnapshotColumn {
  key: string;
  label: string;
}

export interface SnapshotField {
  key: string;
  label: string;
  kind: FieldKind;
  /** text | longtext | html | bool: ค่าที่พร้อมแสดง (html ผ่าน [innerHTML] ซึ่ง Angular sanitize ให้) */
  value?: string;
  /** chips */
  items?: string[];
  /** table */
  columns?: SnapshotColumn[];
  rows?: Record<string, string>[];
}

export interface SnapshotView {
  title: string;
  /** chip ด้านหัวเรื่อง เช่น สถานะ/ความสำคัญ/ประเภท */
  chips: { label: string; value: string }[];
  fields: SnapshotField[];
}

type Lang = 'th' | 'en';

const HIDDEN_KEYS = new Set([
  'id', 'businessId', 'rowVersion', 'isDelete', 'deleteBy', 'deleteDate', 'state',
  'uploadGroupId', 'uploadGroupData', 'uploadReferences', 'attachmentGroupId', 'attachmentId',
]);

const TITLE_KEYS = [
  'title', 'name', 'scenarioName', 'taskName', 'projectName', 'manualTitle', 'deliveryTitle',
  'invoiceTitle', 'documentTitle', 'contractNo',
];
const CHIP_KEYS = ['status', 'testStatus', 'signStatus', 'priority', 'severity', 'type', 'requirementType',
  'specificationType', 'contractType', 'testType', 'deliveryType', 'invoiceType', 'ticketType', 'manualType'];

const LABELS: Record<string, { th: string; en: string }> = {
  title: { th: 'หัวข้อ', en: 'Title' },
  name: { th: 'ชื่อ', en: 'Name' },
  description: { th: 'รายละเอียด', en: 'Description' },
  status: { th: 'สถานะ', en: 'Status' },
  priority: { th: 'ความสำคัญ', en: 'Priority' },
  severity: { th: 'ความรุนแรง', en: 'Severity' },
  type: { th: 'ประเภท', en: 'Type' },
  version: { th: 'เวอร์ชัน', en: 'Version' },
  remark: { th: 'หมายเหตุ', en: 'Remark' },
  comment: { th: 'ความเห็น', en: 'Comment' },
  acceptanceCriteria: { th: 'เกณฑ์การยอมรับ', en: 'Acceptance criteria' },
  businessValue: { th: 'คุณค่าทางธุรกิจ', en: 'Business value' },
  requirementCode: { th: 'รหัสความต้องการ', en: 'Requirement code' },
  requirementType: { th: 'ประเภทความต้องการ', en: 'Requirement type' },
  specificationCode: { th: 'รหัส Specification', en: 'Specification code' },
  specificationType: { th: 'ประเภท Specification', en: 'Specification type' },
  testCaseCode: { th: 'รหัส Test Case', en: 'Test case code' },
  scenarioCode: { th: 'รหัส Scenario', en: 'Scenario code' },
  scenarioName: { th: 'ชื่อ Scenario', en: 'Scenario name' },
  taskCode: { th: 'รหัส Task', en: 'Task code' },
  taskName: { th: 'ชื่อ Task', en: 'Task name' },
  contractNo: { th: 'เลขที่สัญญา', en: 'Contract no.' },
  contractType: { th: 'ประเภทสัญญา', en: 'Contract type' },
  contractValue: { th: 'มูลค่าสัญญา', en: 'Contract value' },
  signStatus: { th: 'สถานะลงนาม', en: 'Sign status' },
  renewalStatus: { th: 'สถานะการต่อสัญญา', en: 'Renewal status' },
  paymentTerms: { th: 'เงื่อนไขการชำระเงิน', en: 'Payment terms' },
  scopeSummary: { th: 'ขอบเขตงาน', en: 'Scope summary' },
  startDate: { th: 'วันเริ่ม', en: 'Start date' },
  endDate: { th: 'วันสิ้นสุด', en: 'End date' },
  dueDate: { th: 'กำหนดเสร็จ', en: 'Due date' },
  assignedTo: { th: 'ผู้รับผิดชอบ', en: 'Assigned to' },
  tester: { th: 'ผู้ทดสอบ', en: 'Tester' },
  testStep: { th: 'ขั้นตอนการทดสอบ', en: 'Test steps' },
  expectedResult: { th: 'ผลที่คาดหวัง', en: 'Expected result' },
  actualResult: { th: 'ผลที่เกิดขึ้นจริง', en: 'Actual result' },
  testStatus: { th: 'ผลการทดสอบ', en: 'Test result' },
  testType: { th: 'ประเภทการทดสอบ', en: 'Test type' },
  projectName: { th: 'ชื่อโครงการ', en: 'Project name' },
  projectCode: { th: 'รหัสโครงการ', en: 'Project code' },
  customerName: { th: 'ลูกค้า', en: 'Customer' },
  createdBy: { th: 'สร้างโดย', en: 'Created by' },
  createdDate: { th: 'วันที่สร้าง', en: 'Created date' },
  updatedBy: { th: 'แก้ไขโดย', en: 'Updated by' },
  updatedDate: { th: 'วันที่แก้ไข', en: 'Updated date' },
  isActive: { th: 'ใช้งาน', en: 'Active' },
  estimateManday: { th: 'ประมาณการ (man-day)', en: 'Estimate (man-day)' },
  actualManday: { th: 'ใช้จริง (man-day)', en: 'Actual (man-day)' },
  items: { th: 'รายการ', en: 'Items' },
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:?\d{2})?)?$/;
const HTML_RE = /<\/?[a-z][\s\S]*?>/i;

export function humanizeKey(key: string, lang: Lang): string {
  const known = LABELS[key];
  if (known) return known[lang];
  const words = key.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/[_-]+/g, ' ').trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

function isUuidLike(v: unknown): boolean {
  return typeof v === 'string' && UUID_RE.test(v);
}

function isHiddenKey(key: string, value: unknown): boolean {
  if (HIDDEN_KEYS.has(key)) return true;
  if (/(^|[a-z0-9])Ids?$/.test(key)) {
    if (Array.isArray(value)) return value.every(isUuidLike);
    return isUuidLike(value) || value === null || value === undefined;
  }
  return false;
}

export function stripHtml(html: string): string {
  return html.replace(/<br\s*\/?>/gi, '\n').replace(/<\/(p|div|li|tr|h[1-6])>/gi, '\n').replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/[ \t]+/g, ' ').replace(/\n\s*\n+/g, '\n').trim();
}

export function formatDateValue(v: string, lang: Lang): string {
  const d = new Date(v);
  if (isNaN(d.getTime())) return v;
  const locale = lang === 'th' ? 'th-TH' : 'en-GB';
  const date = d.toLocaleDateString(locale, { day: '2-digit', month: '2-digit', year: 'numeric' });
  return v.length > 10 ? `${date} ${d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}` : date;
}

/** แปลงค่าเดี่ยวเป็นข้อความ (ใช้ทั้งใน field ปกติและในเซลล์ตาราง) */
function scalarText(key: string, v: unknown, lang: Lang): string {
  if (v === null || v === undefined || v === '') return '-';
  if (typeof v === 'boolean') return v ? (lang === 'th' ? 'ใช่' : 'Yes') : (lang === 'th' ? 'ไม่ใช่' : 'No');
  if (typeof v === 'number') {
    return /(value|amount|price|cost)/i.test(key) ? v.toLocaleString(lang === 'th' ? 'th-TH' : 'en-US', { minimumFractionDigits: 2 }) : String(v);
  }
  if (typeof v === 'string') {
    if (ISO_DATE_RE.test(v)) return formatDateValue(v, lang);
    if (HTML_RE.test(v)) return stripHtml(v);
    return v;
  }
  return JSON.stringify(v);
}

function pushField(out: SnapshotField[], key: string, label: string, v: unknown, lang: Lang, depth: number): void {
  if (Array.isArray(v)) {
    if (v.length === 0) {
      out.push({ key, label, kind: 'text', value: '-' });
    } else if (v.every((x) => x === null || typeof x !== 'object')) {
      out.push({ key, label, kind: 'chips', items: v.map((x) => scalarText(key, x, lang)) });
    } else {
      const objs = v.filter((x) => x && typeof x === 'object') as Record<string, unknown>[];
      const cols: string[] = [];
      objs.forEach((o) => Object.keys(o).forEach((k) => {
        if (!cols.includes(k) && !isHiddenKey(k, o[k])) cols.push(k);
      }));
      out.push({
        key, label, kind: 'table',
        columns: cols.map((c) => ({ key: c, label: humanizeKey(c, lang) })),
        rows: objs.map((o) => Object.fromEntries(cols.map((c) => [c, scalarText(c, o[c], lang)]))),
      });
    }
    return;
  }
  if (v && typeof v === 'object') {
    if (depth >= 2) {
      out.push({ key, label, kind: 'longtext', value: JSON.stringify(v, null, 2) });
      return;
    }
    Object.entries(v as Record<string, unknown>).forEach(([k, child]) => {
      if (isHiddenKey(k, child)) return;
      pushField(out, `${key}.${k}`, `${label} / ${humanizeKey(k, lang)}`, child, lang, depth + 1);
    });
    return;
  }
  if (typeof v === 'string' && HTML_RE.test(v)) {
    out.push({ key, label, kind: 'html', value: v });
  } else if (typeof v === 'string' && (v.includes('\n') || v.length > 80) && !ISO_DATE_RE.test(v)) {
    out.push({ key, label, kind: 'longtext', value: v });
  } else if (typeof v === 'boolean') {
    out.push({ key, label, kind: 'bool', value: scalarText(key, v, lang) });
  } else {
    out.push({ key, label, kind: 'text', value: scalarText(key, v, lang) });
  }
}

export function buildSnapshotView(snapshot: Record<string, unknown>, lang: Lang): SnapshotView {
  const title = String(TITLE_KEYS.map((k) => snapshot[k]).find((v) => typeof v === 'string' && v) ?? '');
  const chips = CHIP_KEYS
    .filter((k) => typeof snapshot[k] === 'string' && snapshot[k])
    .map((k) => ({ label: humanizeKey(k, lang), value: String(snapshot[k]) }));

  const fields: SnapshotField[] = [];
  Object.entries(snapshot).forEach(([key, value]) => {
    if (isHiddenKey(key, value)) return;
    pushField(fields, key, humanizeKey(key, lang), value, lang, 0);
  });
  // field สั้นขึ้นก่อน เนื้อหายาว (html/longtext/table) ไว้ท้าย โดยคงลำดับเดิมในกลุ่มเดียวกัน
  const rank = (f: SnapshotField) => (f.kind === 'text' || f.kind === 'bool' || f.kind === 'chips' ? 0 : 1);
  fields.sort((a, b) => rank(a) - rank(b));
  return { title, chips, fields };
}
