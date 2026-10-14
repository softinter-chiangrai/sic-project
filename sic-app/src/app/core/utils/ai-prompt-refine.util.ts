/**
 * Utility to merge existing form content into AI prompt when overwrite / refine mode is active.
 * Allows LLM to edit, refine, or append to existing content rather than generating from scratch.
 */

export interface ExistingFieldInfo {
  label: string;
  value: any;
}

export function buildRefinePrompt(
  userPrompt: string | undefined | null,
  existingFields: ExistingFieldInfo[],
  isOverwrite: boolean,
): string | undefined {
  const cleanUserPrompt = (userPrompt || '').trim();

  // If not in overwrite mode, or no existing fields provided, return the user prompt as-is
  if (!isOverwrite || !existingFields || existingFields.length === 0) {
    return cleanUserPrompt || undefined;
  }

  // Filter out empty or whitespace-only fields
  const populatedFields = existingFields.filter((f) => {
    if (f.value === null || f.value === undefined) return false;
    const str = String(f.value).trim();
    // Ignore empty HTML tags like <p></p> or whitespace
    const stripped = str.replace(/<[^>]*>/g, '').trim();
    return str !== '' && stripped !== '';
  });

  // If form has no populated content to refine, just return the user prompt
  if (populatedFields.length === 0) {
    return cleanUserPrompt || undefined;
  }

  const sb: string[] = [];
  sb.push('[โหมดแก้ไข/ต่อเติมจากเนื้อหาเดิมในระบบ (Edit & Refine Mode)]');
  sb.push('คำสั่งที่ต้องการให้แก้ไขหรือเพิ่มเติม:');
  sb.push(cleanUserPrompt || 'ช่วยตรวจสอบ ปรับปรุง ขยายความ และเกลาเนื้อหาเดิมให้สมบูรณ์ ชัดเจน และเป็นมืออาชีพยิ่งขึ้น');
  sb.push('\n---');
  sb.push('เนื้อหาเดิมในฟอร์มปัจจุบัน (ให้นำข้อมูลด้านล่างนี้มาเป็นฐานหลัก แล้วทำการแก้ไข ปรับปรุง หรือต่อเติมตามคำสั่งข้างต้น โดยรักษาเนื้อหาเดิมส่วนที่ไม่ถูกสั่งแก้ไว้ ห้ามตัดทิ้ง):');

  for (const field of populatedFields) {
    sb.push(`- ${field.label}: ${field.value}`);
  }
  sb.push('---');
  sb.push('*กรุณาส่งผลลัพธ์กลับมาในรูปแบบ JSON ตามข้อกำหนดโครงสร้างเดิมทุกประการ*');

  return sb.join('\n');
}
