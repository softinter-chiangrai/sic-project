import { HttpClient } from '@angular/common/http';
import { FormGroup } from '@angular/forms';

export interface AiComboOption {
  value: any;
  text?: string;
  label?: string;
}

/**
 * แหล่งตัวเลือกของ combobox: อาร์เรย์ตายตัว หรือ URL (LOV/API ที่คืน [{value,text}] หรือ {data:[...]})
 */
export type AiComboSource = AiComboOption[] | string;

function isEmpty(v: unknown): boolean {
  if (v === null || v === undefined) return true;
  if (Array.isArray(v)) return v.length === 0;
  return String(v).trim() === '';
}

function norm(s: unknown): string {
  return String(s ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9฀-๿]/g, '');
}

/**
 * แปลงข้อความที่ AI ตอบมา (เช่น "High", "ค่าสูง", "development contract") ให้เป็น value ของตัวเลือกจริงใน combobox
 * คืน null ถ้าไม่มีตัวเลือกไหนตรง เพื่อไม่ให้ยัดค่าที่ไม่มีอยู่จริงลงฟอร์ม
 */
export function matchAiComboOption(raw: unknown, options: AiComboOption[]): any | null {
  if (isEmpty(raw) || !options?.length) return null;
  const target = norm(raw);
  if (!target) return null;

  const labelOf = (o: AiComboOption) => o.text ?? o.label ?? '';

  const exact = options.find((o) => norm(o.value) === target || norm(labelOf(o)) === target);
  if (exact) return exact.value;

  if (target.length >= 3) {
    const partial = options.find((o) => {
      const v = norm(o.value);
      const l = norm(labelOf(o));
      return (v && (v.includes(target) || target.includes(v))) || (l && (l.includes(target) || target.includes(l)));
    });
    if (partial) return partial.value;
  }
  return null;
}

/**
 * Smart Preserve Form Patcher.
 *
 * กรอกเฉพาะฟิลด์ที่ยังว่างอยู่ในฟอร์ม (null/undefined/empty string/อาร์เรย์ว่าง) จาก draft ที่ AI สร้างมาให้
 * ห้ามเขียนทับค่าที่มีอยู่แล้ว (รวมค่าเริ่มต้นของฟอร์ม) — ตรวจซ้ำอีกครั้งก่อนกรอกทุกครั้ง แม้ฟิลด์ที่ต้องรอโหลดตัวเลือกจาก API
 *
 * @param combos ฟิลด์ที่เป็น combobox: ระบุแหล่งตัวเลือก (อาร์เรย์หรือ URL) เพื่อแปลงค่าที่ AI ตอบให้เป็น value ที่ใช้จริง
 *               ถ้าแปลงไม่ได้จะข้ามฟิลด์นั้น (ไม่กรอกค่าที่ไม่มีในตัวเลือก)
 * @param http   จำเป็นเมื่อ combos มีแหล่งตัวเลือกแบบ URL
 */
export function smartPatchFormAiDraft(
  form: FormGroup,
  draft: Record<string, any> | null | undefined,
  restrictedFields: string[] = ['id'],
  combos: Record<string, AiComboSource> = {},
  http?: HttpClient,
): void {
  if (!draft) return;

  const canFill = (key: string): boolean => {
    if (restrictedFields.includes(key)) return false;
    const control = form.get(key);
    return !!control && isEmpty(control.value);
  };

  const hasValue = (v: unknown) => v !== null && v !== undefined && String(v).trim() !== '';

  const applyPatch = (patch: Record<string, any>) => {
    const safe: Record<string, any> = {};
    Object.keys(patch).forEach((k) => {
      if (canFill(k)) safe[k] = patch[k]; // ตรวจซ้ำ กันทับค่าที่ผู้ใช้เพิ่งกรอกระหว่างรอโหลดตัวเลือก
    });
    if (Object.keys(safe).length === 0) return;
    form.patchValue(safe);
    form.markAsDirty();
  };

  const patchData: Record<string, any> = {};

  Object.keys(draft).forEach((key) => {
    if (!canFill(key) || !hasValue(draft[key])) return;

    const source = combos[key];
    if (source === undefined) {
      patchData[key] = draft[key];
    } else if (Array.isArray(source)) {
      const matched = matchAiComboOption(draft[key], source);
      if (matched !== null) patchData[key] = matched;
    } else if (http) {
      http.get<any>(source).subscribe({
        next: (res) => {
          const items: AiComboOption[] = Array.isArray(res) ? res : (res?.data ?? []);
          const matched = matchAiComboOption(draft[key], items);
          if (matched !== null) applyPatch({ [key]: matched });
        },
        error: () => {
          /* โหลดตัวเลือกไม่ได้ — ปล่อยฟิลด์ว่างให้ผู้ใช้เลือกเอง */
        },
      });
    }
  });

  applyPatch(patchData);
}
