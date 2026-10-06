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
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DEFAULT_AI_MODEL } from '../../config/ai-models.config';
import { AiModelsService } from '../../services/ai-models.service';
import { AiBatchGenerateService } from '../../services/ai-batch-generate.service';
import { AiHistoryService, AiHistoryItem } from '../../services/ai-history.service';
import { AiAttachmentPayload, filesToAiAttachments } from '../../utils/ai-attachment.util';
import { SicComboboxComponent } from '../sic-combobox/sic-combobox.component';
import { SicAiAttachmentPickerComponent } from '../sic-ai-attachment-picker/sic-ai-attachment-picker.component';

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
 * Standard generic modal component for AI Batch Generation with version history tracking.
 * Features tabs for content generation and history log, themed with system styling tokens.
 */
@Component({
  selector: 'sic-ai-batch-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    SicComboboxComponent,
    SicAiAttachmentPickerComponent,
  ],
  templateUrl: './sic-ai-batch-modal.component.html',
  styleUrl: './sic-ai-batch-modal.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SicAiBatchModalComponent implements OnChanges {
  private batchService = inject(AiBatchGenerateService);
  private aiModelsSvc = inject(AiModelsService);
  private aiHistoryService = inject(AiHistoryService);
  private translate = inject(TranslateService);

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

  readonly activeTab = signal<'generate' | 'history'>('generate');
  readonly prompt = signal('');
  readonly count = signal(5);
  readonly model = signal(DEFAULT_AI_MODEL);
  readonly attachedFiles = signal<File[]>([]);
  readonly isGenerating = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly rows = signal<BatchRow[]>([]);

  readonly histories = signal<AiHistoryItem<Record<string, any>[]>[]>([]);
  readonly previewHistoryId = signal<string | null>(null);
  readonly copiedId = signal<string | null>(null);

  get aiModels() {
    return this.aiModelsSvc.models();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible'] && this.visible) {
      this.prompt.set(this.initialPrompt || '');
      this.rows.set([]);
      this.errorMessage.set(null);
      this.activeTab.set('generate');
      this.previewHistoryId.set(null);
      this.loadHistories();
      if (this.autoGenerate && this.initialPrompt) {
        queueMicrotask(() => this.generate());
      }
    } else if ((changes['projectId'] || changes['moduleType']) && this.visible) {
      this.loadHistories();
    }
  }

  loadHistories(): void {
    const list = this.aiHistoryService.getHistories<Record<string, any>[]>(
      this.moduleType || 'batch',
      this.projectId || 'all'
    );
    this.histories.set(list || []);
  }

  onModelChange(val: any): void {
    const modelId = typeof val === 'object' && val !== null ? (val.id || val.value) : val;
    if (modelId) {
      this.model.set(modelId);
    }
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
            this.errorMessage.set(this.translate.instant('AI_BATCH_NO_RESULT_ERROR'));
            return;
          }
          this.rows.update((existing) => [
            ...existing,
            ...items.map((data) => ({ selected: true, data })),
          ]);

          // Save to AI history
          const summary = `${items.length} ${this.translate.instant('AI_BATCH_ITEMS_COUNT', { count: items.length }) || 'items'}`;
          const title = `${this.moduleLabel || 'Batch'} (${summary})`;
          this.aiHistoryService.addHistory<Record<string, any>[]>(
            this.moduleType || 'batch',
            this.projectId || 'all',
            items,
            this.prompt(),
            this.model(),
            title,
            this.prompt()
          );
          this.loadHistories();
        },
        error: (err) => {
          this.isGenerating.set(false);
          this.errorMessage.set(
            err?.error?.message || err?.message || this.translate.instant('AI_BATCH_CALL_ERROR')
          );
        },
      });
  }

  toggleRow(index: number): void {
    this.rows.update((rows) =>
      rows.map((r, i) => (i === index ? { ...r, selected: !r.selected } : r)),
    );
  }

  toggleAllRows(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.rows.update((rows) => rows.map((r) => ({ ...r, selected: checked })));
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

  restoreHistory(item: AiHistoryItem<Record<string, any>[]>): void {
    if (!item.data || !Array.isArray(item.data)) return;
    this.rows.set(item.data.map((data) => ({ selected: true, data: { ...data } })));
    if (item.prompt) {
      this.prompt.set(item.prompt);
    }
    if (item.model) {
      this.model.set(item.model);
    }
    this.activeTab.set('generate');
  }

  deleteHistory(id: string, event: Event): void {
    event.stopPropagation();
    this.aiHistoryService.deleteHistory(
      this.moduleType || 'batch',
      this.projectId || 'all',
      id
    );
    this.loadHistories();
    if (this.previewHistoryId() === id) {
      this.previewHistoryId.set(null);
    }
  }

  togglePreview(id: string): void {
    this.previewHistoryId.update((current) => (current === id ? null : id));
  }

  copyHistory(item: AiHistoryItem<Record<string, any>[]>): void {
    const text = JSON.stringify(item.data, null, 2);
    navigator.clipboard.writeText(text).then(() => {
      this.copiedId.set(item.id);
      setTimeout(() => this.copiedId.set(null), 2000);
    });
  }

  trackById(_: number, item: { id: string }): string {
    return item.id;
  }

  close(): void {
    this.closed.emit();
  }
}
