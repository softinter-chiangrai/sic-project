// src/app/core/component/sic-trace-link-picker/sic-trace-link-picker.component.ts
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { DialogService } from '../../services/dialog.service';
import {
  TRACE_RELATIONSHIP_OPTIONS,
  TraceLink,
  TraceLinkService,
  TraceRelationshipType,
} from '../../services/trace-link.service';
import { SicButtonComponent } from '../sic-button/sic-button.component';
import { SicComboboxComponent } from '../sic-combobox/sic-combobox.component';

interface TraceEntityTypeDef {
  type: string;
  label: string;
  apiUrl: string;
  valueField: string;
  textField: string;
  paging: boolean;
  params: Record<string, any>;
  // บาง type (DFD/ER) ต้องดึง relationship target type จริงจาก field ของ item ที่เลือก แทนที่จะใช้ type คงที่
  resolveLinkType?: (item: any) => string;
}

@Component({
  selector: 'sic-trace-link-picker',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SicButtonComponent, SicComboboxComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <div class="w-[min(92vw,32rem)] overflow-hidden rounded-2xl border bg-[var(--bg)] text-[var(--text)] shadow-2xl">
      <div class="border-b px-5 py-4" style="border-color: var(--border);">
        <h3 class="text-base font-semibold text-[var(--text-active)]">เพิ่มความสัมพันธ์ (Add Link)</h3>
        <p class="text-sm text-[var(--text-muted)]">ค้นหารายการที่มีอยู่แล้วเพื่อเชื่อมโยงความสัมพันธ์</p>
      </div>
      <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4 px-5 py-4">
        <div>
          <label class="mb-1 block text-sm font-medium text-[var(--text)]">ประเภทรายการ</label>
          <select
            class="w-full rounded-lg border bg-[var(--bg)] px-3 py-2 text-sm"
            style="border-color: var(--border);"
            [formControl]="form.controls.entityType"
            (change)="onEntityTypeChange()"
          >
            <option value="" disabled>เลือกประเภทรายการ</option>
            @for (t of availableEntityTypes; track t.type) {
              <option [value]="t.type">{{ t.label }}</option>
            }
          </select>
        </div>

        <sic-combobox
          label="รายการ"
          formControlName="itemId"
          [apiUrl]="selectedEntityApiUrl()"
          [params]="selectedEntityParams()"
          [paging]="selectedEntityPaging()"
          [valueField]="selectedEntityValueField()"
          [textField]="selectedEntityTextField()"
          pageNumberParam="page"
          pageSizeParam="size"
          placeholder="ค้นหารายการ..."
          [disabled]="!form.controls.entityType.value"
          (selectionChanged)="onItemSelected($event)"
          [required]="true"
        ></sic-combobox>

        <div>
          <label class="mb-1 block text-sm font-medium text-[var(--text)]">ความสัมพันธ์</label>
          <select
            class="w-full rounded-lg border bg-[var(--bg)] px-3 py-2 text-sm"
            style="border-color: var(--border);"
            [formControl]="form.controls.relationshipType"
          >
            @for (opt of relationshipOptions; track opt.value) {
              <option [value]="opt.value">{{ opt.label }}</option>
            }
          </select>
        </div>

        <div class="flex justify-end gap-2 border-t pt-4" style="border-color: var(--border);">
          <sic-button variant="secondary" size="sm" type="button" (click)="cancel()">ยกเลิก</sic-button>
          <sic-button variant="primary" size="sm" type="submit" [disabled]="form.invalid || saving()">
            {{ saving() ? 'กำลังบันทึก...' : 'เพิ่มความสัมพันธ์' }}
          </sic-button>
        </div>
      </form>
    </div>
  `,
})
export class SicTraceLinkPickerComponent {
  // เอนทิตีที่กำลังเปิดฟอร์มอยู่ในขณะนี้ ใช้เป็น "target" ของความสัมพันธ์เสมอ
  // (รายการที่ผู้ใช้ค้นหา/เลือกในไดอะล็อกนี้จะเป็น "source" — สอดคล้องกับ convention เดิมในระบบ
  // ที่ source = ต้นทาง/เอกสารอ้างอิง, target = รายการที่ถูกสร้าง/พึ่งพา)
  @Input({ required: true }) targetType!: string;
  @Input({ required: true }) targetId!: string;
  @Input({ required: true }) projectId!: string;
  // ประเภทที่ไม่ต้องการให้เลือกซ้ำกับตัวเอง (ค่าเริ่มต้นคือ targetType)
  @Input() excludeType?: string;
  // callback แจ้งผลลัพธ์กลับไปยังหน้าที่เปิดไดอะล็อกนี้ (dynamic dialog component รองรับ input เป็น callback เท่านั้น)
  @Input() onLinked?: (link: TraceLink) => void;

  private fb = inject(FormBuilder);
  private dialogService = inject(DialogService);
  private traceLinkService = inject(TraceLinkService);

  saving = signal(false);
  relationshipOptions = TRACE_RELATIONSHIP_OPTIONS;

  private apiBase = environment.apiBaseUrl;

  entityTypes: TraceEntityTypeDef[] = [
    {
      type: 'REQUIREMENT',
      label: 'Requirement',
      apiUrl: `${this.apiBase}/api/pm/requirement`,
      valueField: 'id',
      textField: 'title',
      paging: true,
      params: {},
    },
    {
      type: 'SPECIFICATION',
      label: 'Specification',
      apiUrl: `${this.apiBase}/api/pm/specifications`,
      valueField: 'id',
      textField: 'title',
      paging: true,
      params: {},
    },
    {
      type: 'TASK',
      label: 'Task',
      apiUrl: `${this.apiBase}/api/pm/tasks/search`,
      valueField: 'id',
      textField: 'taskName',
      paging: true,
      params: {},
    },
    {
      type: 'TEST_CASE',
      label: 'Test Case',
      apiUrl: `${this.apiBase}/api/pm/test-cases/paging`,
      valueField: 'id',
      textField: 'title',
      paging: true,
      params: {},
    },
    {
      type: 'BUG',
      label: 'Bug',
      apiUrl: `${this.apiBase}/api/pm/bugs/paging`,
      valueField: 'id',
      textField: 'title',
      paging: true,
      params: {},
    },
    {
      type: 'CHANGE_REQUEST',
      label: 'Change Request',
      apiUrl: `${this.apiBase}/api/pm/change-requests`,
      valueField: 'id',
      textField: 'title',
      paging: true,
      params: {},
    },
    {
      type: 'DESIGN_REVIEW',
      label: 'Design Review',
      apiUrl: `${this.apiBase}/api/pm/design-reviews`,
      valueField: 'id',
      textField: 'title',
      paging: true,
      params: {},
    },
    {
      type: 'DIAGRAM',
      label: 'Diagram (DFD/ER)',
      apiUrl: `${this.apiBase}/api/diagram/tabs`,
      valueField: 'id',
      textField: 'name',
      paging: false,
      params: {},
      resolveLinkType: (item: any) => item?.diagramType || 'DFD',
    },
  ];

  private selectedItem = signal<any>(null);

  form = this.fb.group({
    entityType: ['', Validators.required],
    itemId: ['', Validators.required],
    relationshipType: ['RELATED_TO' as TraceRelationshipType, Validators.required],
  });

  private currentDef = computed(() => {
    const type = this.form.controls.entityType.value;
    return this.entityTypes.find((t) => t.type === type) ?? null;
  });

  selectedEntityApiUrl = computed(() => this.currentDef()?.apiUrl ?? '');
  selectedEntityValueField = computed(() => this.currentDef()?.valueField ?? 'id');
  selectedEntityTextField = computed(() => this.currentDef()?.textField ?? 'name');
  selectedEntityPaging = computed(() => this.currentDef()?.paging ?? true);
  selectedEntityParams = computed(() => ({ projectId: this.projectId }));

  get availableEntityTypes(): TraceEntityTypeDef[] {
    const exclude = this.excludeType ?? this.targetType;
    return this.entityTypes.filter((t) => t.type !== exclude);
  }

  onEntityTypeChange(): void {
    this.form.controls.itemId.setValue('');
    this.selectedItem.set(null);
  }

  onItemSelected(item: any): void {
    this.selectedItem.set(item);
  }

  submit(): void {
    if (this.form.invalid || !this.selectedItem()) return;

    const def = this.currentDef();
    if (!def) return;

    const item = this.selectedItem();
    const sourceType = def.resolveLinkType ? def.resolveLinkType(item) : def.type;
    const sourceId = item?.[def.valueField] ?? item?.id;
    const relationshipType = this.form.controls.relationshipType.value as TraceRelationshipType;

    if (!sourceId) return;

    this.saving.set(true);
    this.traceLinkService
      .createLink({
        projectId: this.projectId,
        sourceType,
        sourceId,
        targetType: this.targetType,
        targetId: this.targetId,
        relationshipType,
      })
      .subscribe({
        next: (link) => {
          this.saving.set(false);
          this.onLinked?.(link);
          this.dialogService.close(true);
        },
        error: (err) => {
          this.saving.set(false);
          this.dialogService.error('เพิ่มความสัมพันธ์ไม่สำเร็จ', err?.error?.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่');
        },
      });
  }

  cancel(): void {
    this.dialogService.close(false);
  }
}
