import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AI_MODEL_OPTIONS, DEFAULT_AI_MODEL } from '../../config/ai-models.config';
import { AiBatchGenerateService } from '../../services/ai-batch-generate.service';
import { AiAttachmentPayload, filesToAiAttachments } from '../../utils/ai-attachment.util';

export interface AiBatchFieldDef {
  key: string;
  label: string;
  type?: 'text' | 'textarea' | 'number' | 'date';
}

interface BatchRow {
  selected: boolean;
  data: Record<string, any>;
}

/**
 * Component ส่วนกลางแบบ Generic สำหรับปุ่ม [ ✨ AI Batch Create ] บนหัวตารางของหน้า List
 * ใดๆ ก็ได้ในระบบ: รับ prompt (+ไฟล์แนบ/รูปภาพ) -> เรียก AI สร้างหลายแถวพร้อมกัน -> แสดงตาราง
 * พรีวิวให้แก้ไข/ติ๊กเลือก -> เมื่อกดบันทึก จะ emit เฉพาะแถวที่เลือกออกไปให้หน้า List เป็นผู้เรียก
 * API สร้างข้อมูล (Append เท่านั้น ไม่มีการเขียนทับข้อมูลเดิม)
 */
@Component({
  selector: 'sic-ai-batch-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sic-ai-batch-modal.component.html',
  styleUrl: './sic-ai-batch-modal.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SicAiBatchModalComponent implements OnChanges {
  private batchService = inject(AiBatchGenerateService);

  @Input({ required: true }) moduleType!: string;
  @Input() moduleLabel = '';
  @Input({ required: true }) fields: AiBatchFieldDef[] = [];
  @Input() visible = false;
  @Input() projectId: string | null = null;
  @Input() initialPrompt = '';
  @Input() autoGenerate = false;
  @Input() saving = false;

  @Output() closed = new EventEmitter<void>();
  @Output() saved = new EventEmitter<Record<string, any>[]>();

  readonly prompt = signal('');
  readonly count = signal(5);
  readonly model = signal(DEFAULT_AI_MODEL);
  readonly attachedFiles = signal<File[]>([]);
  readonly isGenerating = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly rows = signal<BatchRow[]>([]);

  readonly aiModels = AI_MODEL_OPTIONS;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible'] && this.visible) {
      this.prompt.set(this.initialPrompt || '');
      this.rows.set([]);
      this.errorMessage.set(null);
      if (this.autoGenerate && this.initialPrompt) {
        queueMicrotask(() => this.generate());
      }
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files ? Array.from(input.files) : [];
    this.attachedFiles.update((existing) => [...existing, ...files]);
    input.value = '';
  }

  removeFile(index: number): void {
    this.attachedFiles.update((files) => files.filter((_, i) => i !== index));
  }

  async generate(): Promise<void> {
    if (this.isGenerating() || !this.prompt().trim()) return;

    this.isGenerating.set(true);
    this.errorMessage.set(null);

    let attachments: AiAttachmentPayload[] = [];
    if (this.attachedFiles().length) {
      attachments = await filesToAiAttachments(this.attachedFiles());
    }

    this.batchService
      .generate({
        moduleType: this.moduleType,
        prompt: this.prompt(),
        count: this.count(),
        projectId: this.projectId,
        model: this.model(),
        attachments,
      })
      .subscribe({
        next: (items) => {
          this.isGenerating.set(false);
          if (!items.length) {
            this.errorMessage.set('AI ไม่สามารถสร้างข้อมูลได้ กรุณาลองปรับ Prompt หรือไฟล์แนบใหม่');
            return;
          }
          this.rows.update((existing) => [
            ...existing,
            ...items.map((data) => ({ selected: true, data })),
          ]);
        },
        error: (err) => {
          this.isGenerating.set(false);
          this.errorMessage.set(err?.error?.message || err?.message || 'เกิดข้อผิดพลาดในการเรียก AI');
        },
      });
  }

  toggleRow(index: number): void {
    this.rows.update((rows) =>
      rows.map((r, i) => (i === index ? { ...r, selected: !r.selected } : r)),
    );
  }

  removeRow(index: number): void {
    this.rows.update((rows) => rows.filter((_, i) => i !== index));
  }

  updateCell(index: number, key: string, value: any): void {
    this.rows.update((rows) =>
      rows.map((r, i) => (i === index ? { ...r, data: { ...r.data, [key]: value } } : r)),
    );
  }

  get selectedCount(): number {
    return this.rows().filter((r) => r.selected).length;
  }

  saveAll(): void {
    const selected = this.rows()
      .filter((r) => r.selected)
      .map((r) => r.data);
    if (!selected.length) return;
    this.saved.emit(selected);
  }

  close(): void {
    this.closed.emit();
  }
}
