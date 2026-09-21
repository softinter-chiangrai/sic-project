export interface AiAttachmentPayload {
  fileName: string;
  mimeType: string;
  base64Data: string;
}

const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024; // 8MB ต่อไฟล์ (จำกัดเพื่อไม่ให้ payload ใหญ่เกินไปสำหรับ AI provider)

/**
 * แปลงไฟล์ (รูปภาพ/เอกสาร) ที่ผู้ใช้แนบให้ AI เป็น base64 payload สำหรับส่งไป backend
 * ไฟล์ที่มีขนาดเกิน limit จะถูกข้าม (ไม่ throw) เพื่อไม่ให้กระบวนการทั้งชุดล้มเหลว
 */
export async function filesToAiAttachments(files: File[]): Promise<AiAttachmentPayload[]> {
  const results: AiAttachmentPayload[] = [];

  for (const file of files) {
    if (file.size > MAX_FILE_SIZE_BYTES) {
      console.warn(`[AI Attachment] Skipped "${file.name}": exceeds ${MAX_FILE_SIZE_BYTES / (1024 * 1024)}MB limit`);
      continue;
    }

    try {
      const base64Data = await readFileAsBase64(file);
      results.push({
        fileName: file.name,
        mimeType: file.type || 'application/octet-stream',
        base64Data,
      });
    } catch (err) {
      console.error(`[AI Attachment] Failed to read "${file.name}"`, err);
    }
  }

  return results;
}

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const commaIndex = result.indexOf(',');
      resolve(commaIndex >= 0 ? result.substring(commaIndex + 1) : result);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
