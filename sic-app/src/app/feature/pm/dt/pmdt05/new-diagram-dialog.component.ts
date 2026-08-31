// src/app/feature/pm/dt/pmdt06/new-diagram-dialog.component.ts
import { Component, inject, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SicInputComponent } from '../../../../core/component/sic-input/sic-input.component';
import { SicButtonComponent } from '../../../../core/component/sic-button/sic-button.component';
import { SicComboboxComponent } from '../../../../core/component/sic-combobox/sic-combobox.component';
import { DialogService } from '../../../../core/services/dialog.service';
import { ApprovalService } from '../pmdt03/approval.service';
import type { ApprovalFlow } from '../pmdt03/approval.model';
import { environment } from '../../../../../environments/environment';

export interface DiagramEditData {
  id: string;
  name: string;
  type: string;
  rowVersion?: number;
  requirementId?: string;
  requirementTitle?: string;
  approvalFlowId?: string;
  approvalStatus?: string;
  isApproved?: boolean;
}

@Component({
  selector: 'app-new-diagram-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, SicInputComponent, SicButtonComponent, SicComboboxComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <div class="w-[min(92vw,30rem)] overflow-hidden rounded-2xl border bg-[var(--bg)] text-[var(--text)] shadow-2xl">
      <div class="border-b px-5 py-4 flex items-center justify-between" style="border-color: var(--border);">
        <h3 class="text-base font-semibold text-[var(--text-active)] flex items-center gap-2">
          <i class="bi" [class.bi-pencil-square]="editData" [class.bi-plus-circle]="!editData"></i>
          {{ editData ? 'แก้ไขข้อมูล Diagram' : 'สร้าง Diagram ใหม่' }}
        </h3>
        @if (editData?.isApproved) {
          <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
            <i class="bi bi-check-circle-fill"></i> ผ่านการอนุมัติแล้ว
          </span>
        }
      </div>

      <div class="space-y-4 px-5 py-4 max-h-[75vh] overflow-y-auto">
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

        <!-- Requirement ต้นทาง (แสดงเฉพาะตอนสร้างใหม่และมี requirementTitle ส่งมาจาก URL) -->
        @if (requirementTitle && !editData) {
          <div class="p-3 rounded-lg border border-[var(--crm-primary)]/30 bg-[var(--crm-primary)]/5">
            <div class="flex items-center gap-2 text-sm">
              <i class="bi bi-check-circle-fill text-[var(--crm-success)]"></i>
              <span class="font-medium text-[var(--text-active)]">Requirement ต้นทาง:</span>
              <span>{{ requirementTitle }}</span>
            </div>
          </div>
        }

        <!-- Approval Flow Selection (แสดงเฉพาะในโหมดแก้ไข) -->
        @if (editData) {
          <div class="border-t border-[var(--border)] pt-4 mt-2">
            <div class="text-sm font-medium text-[var(--text-active)] mb-2 flex items-center justify-between">
              <span class="flex items-center gap-2">
                <i class="bi bi-check2-circle text-[var(--crm-primary)]"></i>
                กระบวนการอนุมัติ (Approval Flow)
              </span>
              @if (currentApprovalStatus) {
                <span class="text-xs px-2 py-0.5 rounded font-medium" [ngClass]="getApprovalBadgeClass(currentApprovalStatus)">
                  {{ currentApprovalStatus }}
                </span>
              }
            </div>

            <sic-combobox
              label="เลือกกระบวนการอนุมัติ"
              [apiUrl]="approvalFlowApiUrl"
              valueField="id"
              textField="flowName"
              placeholder="เลือกกระบวนการอนุมัติสำหรับ Diagram"
              [clearable]="true"
              [(ngModel)]="selectedFlowId"
              (selectionChanged)="selectedFlowId = $event?.id"
            ></sic-combobox>
            @if (selectedFlowId) {
              <p class="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                <i class="bi bi-send-check"></i> จะส่งขออนุมัติ Diagram นี้ไปยังกระบวนการที่เลือกเมื่อกดบันทึก
              </p>
            }
          </div>
        }
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
  @Input() onSave!: (name: string, type: string, editData: DiagramEditData | undefined, requirementId: string, flowId?: string) => void;
  @Input() editData: DiagramEditData | null = null;
  @Input() projectId!: string;
  @Input() selectedRequirementId: string = '';
  @Input() requirementTitle: string = '';

  name = '';
  type = 'DFD';
  selectedFlowId: string | null = null;
  currentApprovalStatus: string | null = null;

  approvalFlowApiUrl = `${environment.apiBaseUrl}/api/pm/approvals/flows/document-type/DIAGRAM`;
  requirementComboboxUrl = '';

  private dialogService = inject(DialogService);
  private approvalService = inject(ApprovalService);

  ngOnInit(): void {
    if (this.projectId) {
      this.requirementComboboxUrl = `${environment.apiBaseUrl}/api/pm/requirements/combobox?projectId=${this.projectId}`;
    }

    if (this.editData) {
      this.name = this.editData.name;
      this.type = this.editData.type;
      if (this.editData.requirementId) {
        this.selectedRequirementId = this.editData.requirementId;
      }
      if (this.editData.approvalStatus) {
        this.currentApprovalStatus = this.editData.approvalStatus;
      }
      this.loadFlows();
      this.loadExistingApproval();
    }

    if (!this.projectId) {
      console.error('[NewDiagramDialog] projectId is required but not provided!');
      this.dialogService.error('ข้อผิดพลาด', 'ไม่พบ projectId กรุณาลองใหม่');
      this.cancel();
    }
  }

  loadFlows(): void {
    this.approvalService.getFlowsByDocumentType('DIAGRAM').subscribe({
      next: (flows) => {
        if (flows.length === 1 && !this.selectedFlowId) {
          this.selectedFlowId = flows[0].id;
        }
      },
      error: () => {}
    });
  }

  loadExistingApproval(): void {
    if (!this.editData?.id) return;
    this.approvalService.getDocumentStatus('DIAGRAM', this.editData.id).subscribe({
      next: (approval: any) => {
        if (approval) {
          this.currentApprovalStatus = approval.status || approval.statusText;
          if (approval.flowId) {
            this.selectedFlowId = approval.flowId;
          } else if (approval.flow?.id) {
            this.selectedFlowId = approval.flow.id;
          }
        }
      },
      error: () => {}
    });
  }

  onRequirementSelected(event: any): void {
    if (event && event.id) {
      this.selectedRequirementId = event.id;
      this.requirementTitle = event.title || '';
    } else {
      this.selectedRequirementId = '';
      this.requirementTitle = '';
    }
  }

  getApprovalBadgeClass(status: string): string {
    const s = status.toUpperCase();
    if (s.includes('APPROVED')) return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
    if (s.includes('PENDING') || s.includes('REVIEW')) return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
    if (s.includes('REJECT')) return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
  }

  get canSave(): boolean {
    const basicValid = this.name.trim().length > 0 && this.type.length > 0;
    if (this.editData) {
      return basicValid && !!this.selectedFlowId;
    }
    return basicValid;
  }

  save(): void {
    if (!this.canSave) return;
    this.onSave(
      this.name.trim(),
      this.type,
      this.editData || undefined,
      this.selectedRequirementId,
      this.selectedFlowId || undefined
    );
    this.dialogService.close(true);
  }

  cancel(): void {
    this.dialogService.close(false);
  }
}