// src/app/feature/pm/dt/pmdt05/pmdt05.component.ts

import { CommonModule } from '@angular/common';
import {
  Component,
  inject,
  Injectable,
  OnInit,
  OnDestroy,
  signal,
  ChangeDetectorRef,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormsModule,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Observable, of, Subscription, interval, takeWhile } from 'rxjs';
import { delay, finalize, tap } from 'rxjs/operators';

// Components
import { SicButtonComponent } from '../../../../core/component/sic-button/sic-button.component';
import { SicComboboxComponent } from '../../../../core/component/sic-combobox/sic-combobox.component';
import { SicInputAreaComponent } from '../../../../core/component/sic-input-area/sic-input-area.component';
import { SicInputComponent } from '../../../../core/component/sic-input/sic-input.component';
import { SicCardComponent } from '../../../../core/component/sic-card/sic-card.component';
import { SicCheckboxComponent } from '../../../../core/component/sic-checkbox/sic-checkbox.component';
import { SicDatePipe } from '../../../../core/pipes/sic-date.pipe';

// ✅ เปลี่ยนเป็น sic-tiptap-editor
import { SicTiptapEditorComponent } from '../../../../core/component/sic-tiptap-editor/sic-tiptap-editor.component';

// Services
import type { CanComponentDeactivate } from '../../../../core/guard/can-deactivate.guard';
import { DialogService } from '../../../../core/services/dialog.service';
import { ApprovalService } from '../pmdt03/approval.service';
import type { ApprovalFlow } from '../pmdt03/approval.model';
import { RequirementExportService } from './requirement-export.service';
import { NavigationService } from '../../../../core/services/navigation.service';

// Preview Component
import { SicRequirementPreviewComponent } from './pmdt05-preview/pmdt05-preview.component';

// ===== Model =====
export interface RequirementModel {
  id: string;
  requirementCode: string;
  title: string;
  description: string;
  requirementType: string;
  source: string;
  priority: string;
  businessValue: string;
  acceptanceCriteria: string;
  projectId: string;
  projectName?: string;
  createdBy: string;
  baConfirmStatus: string;
  customerConfirmStatus: string;
  version: string;
  status: string;
  isActive: boolean;
  state?: number;
  rowVersion?: number;
  createdAt?: string;
  updatedAt?: string;
}

// ===== Service (Mock) =====
@Injectable({ providedIn: 'root' })
export class Pmdt05Service {
  private mockRequirements: RequirementModel[] = [
    {
      id: '1',
      requirementCode: 'REQ-001',
      title: 'ระบบ Login',
      description: '<p>ผู้ใช้สามารถเข้าสู่ระบบด้วย Username และ Password</p>',
      requirementType: 'Functional Requirement',
      source: 'ลูกค้า',
      priority: 'Must',
      businessValue: 'สูง',
      acceptanceCriteria: '<p>ผู้ใช้กรอก Username/Password ถูกต้องแล้วเข้าสู่ระบบได้</p>',
      projectId: '1',
      projectName: 'ระบบ CRM',
      createdBy: 'สมหญิง รักเรียน',
      baConfirmStatus: 'Confirmed',
      customerConfirmStatus: 'Confirmed',
      version: 'v1.0',
      status: 'Approved',
      isActive: true,
      state: 1,
      rowVersion: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  apiGetComboboxProject = '/api/pm/requirement/combobox-project';
  apiGetLovRequirementType = '/api/pm/requirement/lov-type';
  apiGetLovPriority = '/api/pm/requirement/lov-priority';
  apiGetLovStatus = '/api/pm/requirement/lov-status';

  save(req: RequirementModel): Observable<string> {
    console.log('📝 Saving requirement:', req);
    return of('บันทึกสำเร็จ').pipe(delay(500));
  }

  getRequirement(id: string): Observable<RequirementModel> {
    const found = this.mockRequirements.find((r) => r.id === id);
    if (found) {
      return of(found).pipe(delay(300));
    }
    const emptyReq: RequirementModel = {
      id: '',
      requirementCode: '',
      title: '',
      description: '',
      requirementType: '',
      source: '',
      priority: 'Must',
      businessValue: '',
      acceptanceCriteria: '',
      projectId: '',
      projectName: '',
      createdBy: '',
      baConfirmStatus: 'Pending',
      customerConfirmStatus: 'Pending',
      version: 'v1.0',
      status: 'Draft',
      isActive: true,
      state: 1,
      rowVersion: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return of(emptyReq).pipe(delay(300));
  }

  autoSave(req: RequirementModel): Observable<string> {
    console.log('💾 Auto-saving requirement:', req);
    return of('Auto-save success').pipe(delay(200));
  }
}

// ===== Component =====
@Component({
  selector: 'app-pmdt05',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    SicButtonComponent,
    SicComboboxComponent,
    SicInputComponent,
    SicInputAreaComponent,
    SicRequirementPreviewComponent,
    SicCardComponent,
    SicCheckboxComponent,
    SicTiptapEditorComponent,      // ✅ ใช้ตัวใหม่
    SicDatePipe,
  ],
  templateUrl: './pmdt05.component.html',
  styles: [
    `
      .pmdt05-layout {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1.5rem;
        height: calc(100vh - 200px);
        min-height: 600px;
      }

      .pmdt05-layout--split {
        grid-template-columns: 1fr 1fr;
      }

      .pmdt05-layout--preview-only {
        grid-template-columns: 1fr;
      }

      .pmdt05-layout--edit-only {
        grid-template-columns: 1fr;
      }

      .pmdt05-panel {
        overflow-y: auto;
        padding: 0.5rem;
        background: var(--sidebar);
        border-radius: 0.75rem;
        border: 1px solid var(--border);
      }

      .pmdt05-panel--preview {
        background: var(--bg);
      }

      @media (max-width: 768px) {
        .pmdt05-layout {
          grid-template-columns: 1fr;
          height: auto;
        }
      }

      .auto-save-indicator {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.75rem;
        color: var(--text-muted);
        padding: 0.25rem 0.75rem;
        border-radius: 9999px;
        background: var(--sidebar-hover);
      }

      .auto-save-indicator.saving {
        color: var(--crm-primary);
      }

      .auto-save-indicator.saved {
        color: var(--crm-success);
      }

      .view-mode-toggle {
        display: flex;
        gap: 0.25rem;
        background: var(--bg);
        border-radius: 0.5rem;
        padding: 0.25rem;
        border: 1px solid var(--border);
      }

      .view-mode-toggle button {
        padding: 0.25rem 0.75rem;
        border: none;
        border-radius: 0.375rem;
        background: transparent;
        color: var(--text-muted);
        font-size: 0.75rem;
        cursor: pointer;
        transition: all 0.15s;
      }

      .view-mode-toggle button.active {
        background: var(--crm-primary);
        color: white;
      }

      .view-mode-toggle button:hover:not(.active) {
        background: var(--sidebar-hover);
      }
    `,
  ],
})
export class Pmdt05Component implements OnInit, OnDestroy, CanComponentDeactivate {
  // ===== Dependencies =====
  readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);
  readonly service = inject(Pmdt05Service);
  readonly dialog = inject(DialogService);
  private readonly fb = inject(FormBuilder);
  private readonly approvalService = inject(ApprovalService);
  private readonly exportService = inject(RequirementExportService);
  private readonly navigation = inject(NavigationService);
  private readonly cdr = inject(ChangeDetectorRef);

  // ===== Form =====
  form!: FormGroup;
  isEdit = false;
  reqId: string | null = null;
  isLoading = false;
  isSaving = false;
  isAutoSaving = false;
  lastAutoSaveTime: Date | null = null;

  // ===== Approval Flow =====
  flows: ApprovalFlow[] = [];
  selectedFlowId: string | null = null;
  isLoadingFlows = false;

  // ===== View Mode =====
  viewMode: 'edit' | 'split' | 'preview' = 'split';

  // ❌ ลบ descriptionContent และ acceptanceCriteriaContent signals แล้ว
  // ใช้ form control โดยตรง

  // ===== Auto-save =====
  private autoSaveSubscription: Subscription | null = null;
  private formChangeSubscription: Subscription | null = null;
  private autoSaveEnabled = true;
  private autoSaveInterval = 30000; // 30 seconds

  // ===== Source Options =====
  sourceOptions = ['ลูกค้า', 'BA', 'เอกสาร', 'ประชุม'];

  // ===== CanDeactivate =====
  pageDirty = () => this.form?.dirty ?? false;

  // ===== Lifecycle =====
  ngOnInit(): void {
    this.initForm();
    this.loadFlows();

    this.route.params.subscribe((params) => {
      const id = params['id'];
      if (id) {
        this.isEdit = true;
        this.reqId = id;
        this.loadRequirement(id);
      } else {
        // New requirement - set default project from query params
        this.route.queryParams.subscribe((qParams) => {
          if (qParams['projectId']) {
            this.form.patchValue({ projectId: qParams['projectId'] });
          }
        });
      }
    });

    // ❌ ไม่ต้อง sync signals แล้ว เพราะใช้ form control โดยตรง

    // Setup auto-save
    this.setupAutoSave();

    // Watch for form changes to mark dirty
    this.formChangeSubscription = this.form.valueChanges.subscribe(() => {
      // Trigger dirty state
    });
  }

  ngOnDestroy(): void {
    this.autoSaveSubscription?.unsubscribe();
    this.formChangeSubscription?.unsubscribe();
  }

  // ===== Form Initialization =====
  initForm(): void {
    this.form = this.fb.group({
      id: [null],
      requirementCode: [null, [Validators.required, Validators.maxLength(30)]],
      title: [null, [Validators.required, Validators.maxLength(255)]],
      description: [null, [Validators.required]],
      requirementType: [null, [Validators.required]],
      source: [null, [Validators.maxLength(100)]],
      priority: ['Must', [Validators.required]],
      businessValue: [null, [Validators.maxLength(255)]],
      acceptanceCriteria: [null],
      projectId: [null, [Validators.required]],
      projectName: [null],
      createdBy: [null, [Validators.maxLength(100)]],
      baConfirmStatus: ['Pending'],
      customerConfirmStatus: ['Pending'],
      version: ['v1.0'],
      status: ['Draft'],
      isActive: [true],
      state: [null],
      rowVersion: [null],
    });
  }

  // ===== Data Loading =====
  loadRequirement(id: string) {
    this.isLoading = true;
    this.service.getRequirement(id).subscribe({
      next: (data) => {
        this.form.patchValue(data);
        this.isLoading = false;
        this.form.markAsPristine();
        console.log('✅ โหลดข้อมูล Requirement สำเร็จ:', data);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('❌ โหลดข้อมูลไม่สำเร็จ:', error);
        this.dialog.error('โหลดข้อมูลไม่สำเร็จ', 'ไม่พบข้อมูล Requirement รหัสนี้');
        this.navigation.navigate(['/feature/pm/requirement']);
      },
    });
  }

  loadFlows() {
    this.isLoadingFlows = true;
    this.approvalService.getFlowsByDocumentType('REQUIREMENT').subscribe({
      next: (flows) => {
        this.flows = flows;
        this.isLoadingFlows = false;
        if (flows.length === 1) {
          this.selectedFlowId = flows[0].id;
        }
      },
      error: () => {
        this.isLoadingFlows = false;
        console.warn('ไม่สามารถโหลด Approval Flow ได้');
      },
    });
  }

  // ❌ ไม่ต้องมี onDescriptionChange และ onAcceptanceCriteriaChange

  // ===== Auto-save =====
  private setupAutoSave(): void {
    if (!this.autoSaveEnabled) return;

    this.autoSaveSubscription = interval(this.autoSaveInterval)
      .pipe(
        takeWhile(() => this.autoSaveEnabled),
        tap(() => {
          if (this.form.dirty && this.form.valid) {
            this.performAutoSave();
          }
        })
      )
      .subscribe();
  }

  private performAutoSave(): void {
    if (this.isSaving || this.isAutoSaving) return;

    const data = this.form.value as RequirementModel;
    if (!data.title && !data.description) return; // Skip empty

    this.isAutoSaving = true;
    this.lastAutoSaveTime = new Date();

    this.service.autoSave(data).subscribe({
      next: () => {
        this.isAutoSaving = false;
        this.form.markAsPristine({ onlySelf: true });
        this.cdr.markForCheck();
      },
      error: () => {
        this.isAutoSaving = false;
        this.cdr.markForCheck();
      },
    });
  }

  manualAutoSave(): void {
    this.performAutoSave();
  }

  getAutoSaveStatus(): string {
    if (this.isAutoSaving) return 'saving';
    if (this.lastAutoSaveTime) {
      const diff = Date.now() - this.lastAutoSaveTime.getTime();
      if (diff < 5000) return 'saved';
    }
    if (this.form.dirty) return 'dirty';
    return 'idle';
  }

  getAutoSaveText(): string {
    const status = this.getAutoSaveStatus();
    switch (status) {
      case 'saving':
        return '💾 กำลังบันทึกอัตโนมัติ...';
      case 'saved':
        return '✅ บันทึกอัตโนมัติ ' + this.formatTimeDiff(this.lastAutoSaveTime);
      case 'dirty':
        return '⏳ ยังไม่ได้บันทึก';
      default:
        return '💾 บันทึกอัตโนมัติ';
    }
  }

  private formatTimeDiff(date: Date | null): string {
    if (!date) return '';
    const diff = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diff < 60) return `(${diff} วินาทีที่แล้ว)`;
    return `(${Math.floor(diff / 60)} นาทีที่แล้ว)`;
  }

  // ===== View Mode =====
  setViewMode(mode: 'edit' | 'split' | 'preview'): void {
    this.viewMode = mode;
    this.cdr.markForCheck();
  }

  // ===== Preview Data =====
  getPreviewData(): any {
    const value = this.form.value;
    return {
      requirementCode: value.requirementCode || '...',
      title: value.title || '...',
      description: value.description || '<em>กรุณากรอกรายละเอียด</em>',
      acceptanceCriteria: value.acceptanceCriteria || '',
      priority: value.priority || 'Must',
      requirementType: value.requirementType || '',
      source: value.source || '',
      businessValue: value.businessValue || '',
      createdBy: value.createdBy || 'ผู้ใช้งาน',
      version: value.version || 'v1.0',
      status: value.status || 'Draft',
      projectName: value.projectName || 'กำลังโหลด...',
      createdAt: new Date().toISOString(),
    };
  }

  getStatusText(status: string): string {
    const map: Record<string, string> = {
      Draft: 'ร่าง',
      'In Review': 'อยู่ระหว่างตรวจสอบ',
      Approved: 'อนุมัติแล้ว',
      Changed: 'เปลี่ยนแปลง',
      Cancelled: 'ยกเลิก',
    };
    return map[status] || status;
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      Draft: 'draft',
      'In Review': 'in-review',
      Approved: 'approved',
      Changed: 'changed',
      Cancelled: 'cancelled',
    };
    return map[status] || 'draft';
  }

  // ===== Export =====
  async exportRequirement(format: 'pdf' | 'docx' | 'html'): Promise<void> {
    if (this.form.invalid) {
      this.dialog.warn('ฟอร์มไม่สมบูรณ์', 'กรุณากรอกข้อมูลให้ครบถ้วนก่อนส่งออก');
      return;
    }

    const data = this.form.value;
    this.isSaving = true;

    try {
      // First, ensure the requirement is saved
      if (this.form.dirty) {
        await new Promise<void>((resolve, reject) => {
          this.service.save(data).subscribe({
            next: () => {
              this.form.markAsPristine();
              resolve();
            },
            error: (err) => reject(err),
          });
        });
      }

      // Get the latest data with ID
      const exportData = {
        ...data,
        id: data.id || this.reqId,
      };

      const blob = await this.exportService.exportRequirement(exportData, format);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${data.requirementCode || 'requirement'}.${format === 'pdf' ? 'pdf' : format === 'docx' ? 'docx' : 'html'}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      this.dialog.success('ส่งออกสำเร็จ', `ไฟล์ ${format.toUpperCase()} ถูกสร้างเรียบร้อย`);
    } catch (error: any) {
      this.dialog.error('ส่งออกไม่สำเร็จ', error.message || 'เกิดข้อผิดพลาด');
    } finally {
      this.isSaving = false;
    }
  }

  // ===== Submit =====
  submitForApproval() {
    if (!this.selectedFlowId) {
      this.dialog.warn('กรุณาเลือก Approval Flow', 'ต้องเลือกกระบวนการอนุมัติก่อนส่ง');
      return;
    }

    const data = this.form.value as RequirementModel;
    if (!data.id) {
      this.dialog.warn('ยังไม่ได้บันทึกข้อมูล', 'กรุณาบันทึก Requirement ก่อนส่งขออนุมัติ');
      return;
    }

    this.approvalService
      .submitForApproval({
        documentType: 'REQUIREMENT',
        documentId: data.id,
        documentCode: data.requirementCode,
        documentTitle: data.title,
        version: data.version,
        flowId: this.selectedFlowId,
        comment: 'ส่งขออนุมัติ Requirement',
      })
      .subscribe({
        next: () => {
          this.dialog.success('ส่งขออนุมัติสำเร็จ', 'Requirement ถูกส่งเข้าสู่กระบวนการอนุมัติแล้ว');
          this.form.patchValue({ status: 'In Review' });
        },
        error: (err) => {
          this.dialog.error('ส่งขออนุมัติไม่สำเร็จ', err.error?.message || 'เกิดข้อผิดพลาด');
        },
      });
  }

  // ===== CRUD Actions =====
  onBack(): void {
    const projectId = this.form.get('projectId')?.value;
    if (this.form.dirty) {
      this.dialog
        .confirm('ยืนยัน', 'ข้อมูลยังไม่ได้บันทึก ต้องการออกใช่หรือไม่?')
        .then((confirmed) => {
          if (confirmed) {
            this.navigateBack(projectId);
          }
        });
    } else {
      this.navigateBack(projectId);
    }
  }

  private navigateBack(projectId?: string): void {
    if (projectId) {
      this.navigation.navigate(['/feature/pm/requirement'], {
        queryParams: { projectId },
      });
    } else {
      this.navigation.navigate(['/feature/pm/requirement']);
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.dialog.warn('ฟอร์มไม่ถูกต้อง', 'กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง');
      return;
    }

    this.isSaving = true;
    const data = this.form.value as RequirementModel;

    // Set state
    data.state = this.isEdit ? 3 : 4; // Modified or Added
    if (!this.isEdit) {
      data.rowVersion = 0;
    }

    this.service.save(data).subscribe({
      next: (response) => {
        this.isSaving = false;
        this.form.markAsPristine();
        this.dialog.success('บันทึกสำเร็จ', 'ข้อมูล Requirement ถูกบันทึกเรียบร้อย').then(() => {
          // If it's a new requirement, update the ID
          if (!this.isEdit) {
            // In real implementation, response would contain the ID
            this.reqId = 'new-id';
            this.isEdit = true;
          }
          this.navigateBack(data.projectId);
        });
      },
      error: (error) => {
        this.isSaving = false;
        this.dialog.error('บันทึกไม่สำเร็จ', error.message || 'เกิดข้อผิดพลาด');
      },
    });
  }

  // ===== Helper =====
  get isMobile(): boolean {
    return window.innerWidth < 768;
  }

  get editPanelClass(): string {
    if (this.viewMode === 'edit') return 'pmdt05-panel pmdt05-panel--edit';
    if (this.viewMode === 'preview') return 'pmdt05-panel pmdt05-panel--preview';
    return 'pmdt05-panel pmdt05-panel--edit';
  }

  get previewPanelClass(): string {
    if (this.viewMode === 'preview') return 'pmdt05-panel pmdt05-panel--preview';
    return 'pmdt05-panel pmdt05-panel--preview';
  }
}

export default Pmdt05Component;