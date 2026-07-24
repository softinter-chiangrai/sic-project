// src/app/feature/pm/dt/pmdt06/new-diagram-dialog.component.ts
import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SicInputComponent } from '../../../../core/component/sic-input/sic-input.component';
import { SicButtonComponent } from '../../../../core/component/sic-button/sic-button.component';
import { DialogService } from '../../../../core/services/dialog.service';

export interface DiagramEditData {
  id: string;
  name: string;
  type: string;
  rowVersion?: number;
}

@Component({
  selector: 'app-new-diagram-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, SicInputComponent, SicButtonComponent],
  template: `
    <div class="w-[min(92vw,28rem)] overflow-hidden rounded-2xl border bg-[var(--bg)] text-[var(--text)] shadow-2xl">
      <div class="border-b px-5 py-4" style="border-color: var(--border);">
        <h3 class="text-base font-semibold text-[var(--text-active)]">
          {{ editData ? 'แก้ไข Diagram' : 'สร้าง Diagram ใหม่' }}
        </h3>
      </div>

      <div class="space-y-4 px-5 py-4">
        <!-- ชื่อ Diagram -->
        <sic-input
          label="ชื่อ Diagram"
          [(ngModel)]="name"
          [ngModelOptions]="{ standalone: true }"
          placeholder="ป้อนชื่อ diagram"
          [required]="true"
        ></sic-input>

        <!-- ประเภท Diagram -->
        <div>
          <label class="block text-sm font-medium text-[var(--text-active)] mb-1">ประเภท Diagram</label>
          <select
            [(ngModel)]="type"
            class="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--crm-primary)]/20 focus:border-[var(--crm-primary)] appearance-none pr-8 transition-all"
          >
            <option value="DFD">DFD</option>
            <option value="ER">ER</option>
            <option value="Flowchart">Flowchart</option>
            <option value="Sequence">Sequence</option>
            <option value="Class">Class</option>
            <option value="State">State</option>
            <option value="Gantt">Gantt</option>
            <option value="Mindmap">Mindmap</option>
            <option value="Journey">Journey</option>
            <option value="Pie">Pie</option>
            <option value="C4">C4</option>
            <option value="Use Case">Use Case</option>
          </select>
        </div>

        <!-- ✅ แสดง Requirement ที่เลือกจากหน้าก่อนหน้า -->
        @if (requirementTitle) {
          <div class="p-3 rounded-lg border border-[var(--crm-primary)]/30 bg-[var(--crm-primary)]/5">
            <div class="flex items-center gap-2 text-sm">
              <i class="bi bi-check-circle-fill text-[var(--crm-success)]"></i>
              <span class="font-medium text-[var(--text-active)]">Requirement ต้นทาง:</span>
              <span>{{ requirementTitle }}</span>
            </div>
          </div>
        }

        <p class="text-xs text-[var(--text-muted)]">
          <i class="bi bi-info-circle"></i>
          Diagram นี้จะเชื่อมโยงกับ Requirement ที่เลือกไว้
        </p>
      </div>

      <div class="flex justify-end gap-2 border-t px-5 py-4" style="border-color: var(--border);">
        <sic-button variant="secondary" size="sm" (click)="cancel()">ยกเลิก</sic-button>
        <sic-button variant="primary" size="sm" [disabled]="!canSave" (click)="save()">
          {{ editData ? 'บันทึก' : 'สร้าง' }}
        </sic-button>
      </div>
    </div>
  `
})
export class NewDiagramDialogComponent implements OnInit {
  @Input() onSave!: (name: string, type: string, editData: DiagramEditData | undefined, requirementId: string) => void;
  @Input() editData: DiagramEditData | null = null;
  @Input() projectId!: string;
  @Input() selectedRequirementId: string = '';    // ✅ รับจาก parent
  @Input() requirementTitle: string = '';          // ✅ รับชื่อจาก parent

  name = '';
  type = 'DFD';

  private dialogService = inject(DialogService);

  ngOnInit(): void {
    if (this.editData) {
      this.name = this.editData.name;
      this.type = this.editData.type;
    }
    if (!this.projectId) {
      console.error('[NewDiagramDialog] projectId is required but not provided!');
      this.dialogService.error('ข้อผิดพลาด', 'ไม่พบ projectId กรุณาลองใหม่');
      this.cancel();
    }
  }

  get canSave(): boolean {
    // ✅ ต้องมี requirementId ด้วย (มาจาก parent)
    return this.name.trim().length > 0 && this.type.length > 0 && !!this.selectedRequirementId;
  }

  save(): void {
    if (!this.canSave) return;
    // ✅ ส่ง requirementId ที่ได้จาก parent ไปด้วย
    this.onSave(
      this.name.trim(),
      this.type,
      this.editData || undefined,
      this.selectedRequirementId
    );
    this.dialogService.close(true);
  }

  cancel(): void {
    this.dialogService.close(false);
  }
}