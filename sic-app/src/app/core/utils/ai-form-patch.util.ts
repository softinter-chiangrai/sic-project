import { FormGroup } from '@angular/forms';

/**
 * Smart Preserve Form Patcher.
 *
 * กรอกเฉพาะฟิลด์ที่ยังว่างอยู่ในฟอร์ม (null/undefined/empty string) จาก draft ที่ AI สร้างมาให้
 * ห้ามเขียนทับค่าที่ผู้ใช้กรอกไว้แล้ว และห้ามแตะฟิลด์ที่เป็นรหัส/ID ของระบบ
 */
export function smartPatchFormAiDraft(
  form: FormGroup,
  draft: Record<string, any> | null | undefined,
  restrictedFields: string[] = ['id', 'code', 'projectCode', 'taskCode', 'customerCode', 'contractCode', 'ticketCode', 'invoiceNo', 'testCaseCode'],
): void {
  if (!draft) return;

  const patchData: Record<string, any> = {};

  Object.keys(draft).forEach((key) => {
    if (restrictedFields.includes(key)) return;

    const control = form.get(key);
    if (!control) return;

    const currentValue = control.value;
    const isAlreadyFilled = currentValue !== null && currentValue !== undefined && String(currentValue).trim() !== '';

    if (!isAlreadyFilled && draft[key] !== null && draft[key] !== undefined && String(draft[key]).trim() !== '') {
      patchData[key] = draft[key];
    }
  });

  if (Object.keys(patchData).length === 0) return;

  form.patchValue(patchData);
  form.markAsDirty();
}
