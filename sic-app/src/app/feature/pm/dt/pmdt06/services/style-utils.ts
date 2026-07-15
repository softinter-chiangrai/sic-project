// src/app/feature/pm/dt/pmdt06/utils/style-utils.ts

export interface CellStyleObject {
  [key: string]: string | number | boolean;
}

/**
 * แปลงสตริง style (แบบ maxgraph) ให้เป็น Object
 * เช่น 'rounded=1;whiteSpace=wrap;fillColor=#E3F2FD;' -> { rounded: true, whiteSpace: 'wrap', fillColor: '#E3F2FD' }
 */
export function parseStyleString(styleStr: string | null | undefined): CellStyleObject {
  if (!styleStr) return {};
  const result: CellStyleObject = {};
  const parts = styleStr.split(';').filter(p => p.trim() !== '');
  for (const part of parts) {
    const [key, value] = part.split('=').map(s => s.trim());
    if (!key) continue;
    let parsedValue: string | number | boolean = value;
    if (value === '1') parsedValue = true;
    else if (value === '0') parsedValue = false;
    else if (!isNaN(Number(value)) && value !== '') parsedValue = Number(value);
    result[key] = parsedValue;
  }
  return result;
}

/**
 * แปลง Object style กลับเป็นสตริง
 * รองรับทั้ง CellStyleObject และ CellStyle (จาก maxgraph) โดยจะกรองเฉพาะ primitive
 */
export function stringifyStyleObject(styleObj: any): string {
  if (!styleObj) return '';
  const parts: string[] = [];
  for (const [key, val] of Object.entries(styleObj)) {
    // ข้ามค่า null, undefined, และฟังก์ชัน
    if (val === null || val === undefined) continue;
    if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') {
      let valueStr: string;
      if (typeof val === 'boolean') valueStr = val ? '1' : '0';
      else if (typeof val === 'number') valueStr = String(val);
      else valueStr = String(val);
      parts.push(`${key}=${valueStr}`);
    }
  }
  return parts.join(';');
}

/**
 * รวม style objects (override)
 */
export function mergeStyleObjects(...styles: (CellStyleObject | null | undefined)[]): CellStyleObject {
  const result: CellStyleObject = {};
  for (const style of styles) {
    if (style) {
      for (const [key, val] of Object.entries(style)) {
        result[key] = val;
      }
    }
  }
  return result;
}