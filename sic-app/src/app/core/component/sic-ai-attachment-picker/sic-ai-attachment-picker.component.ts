import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

/**
 * ตัวเลือกไฟล์/รูปภาพสำหรับแนบไปกับ AI Draft ใช้ร่วมกันในทุกหน้าฟอร์มที่มีปุ่ม "Generate with AI"
 * เก็บ state เป็น plain @Input/@Output เพื่อให้ host component เป็นเจ้าของ signal เดียว (ไม่ duplicate state).
 */
@Component({
  selector: 'sic-ai-attachment-picker',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './sic-ai-attachment-picker.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SicAiAttachmentPickerComponent {
  @Input() files: File[] = [];
  @Output() filesChange = new EventEmitter<File[]>();

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const newFiles = input.files ? Array.from(input.files) : [];
    if (newFiles.length) {
      this.filesChange.emit([...this.files, ...newFiles]);
    }
    input.value = '';
  }

  removeFile(index: number): void {
    this.filesChange.emit(this.files.filter((_, i) => i !== index));
  }

  trackByFile(index: number, file: File): string {
    return file.name + '_' + file.size + '_' + index;
  }
}
