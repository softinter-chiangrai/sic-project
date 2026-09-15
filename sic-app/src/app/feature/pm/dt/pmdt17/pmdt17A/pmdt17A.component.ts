import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { SicButtonComponent } from '../../../../../core/component/sic-button/sic-button.component';
import { SicVersionBadgeComponent } from '../../../../../core/component/sic-version-badge/sic-version-badge.component';
import { SicComboboxComponent } from '../../../../../core/component/sic-combobox/sic-combobox.component';
import { SicInputComponent } from '../../../../../core/component/sic-input/sic-input.component';
import { SicDatepickerComponent } from '../../../../../core/component/sic-datepicker/sic-datepicker.component';
import { SicTimepickerComponent } from '../../../../../core/component/sic-timepicker/sic-timepicker.component';
import { SicTiptapEditorComponent } from '../../../../../core/component/sic-tiptap-editor/sic-tiptap-editor.component';
import { ApprovalService } from '../../pmdt03/approval.service';
import type { ApprovalFlow } from '../../pmdt03/approval.model';
import { CanComponentDeactivate } from '../../../../../core/guard/can-deactivate.guard';
import { DialogService } from '../../../../../core/services/dialog.service';
import { CustomerStateService } from '../../../../../core/services/customer-state.service';
import { BusinessService } from '../../../../../core/services/business.service';
import { SicFromData } from '../../../../../core/model/sic-from-data';

import { Pmdt17AService } from './pmdt17A.service';
import { Pmdt17AForm } from './pmdt17A.form';
import { PmMaTicketModel } from './pmdt17A.model';
import { SicEntityState } from '../../../../../core/model/sic-base-model';
import { apiBaseUrl } from '../../../../../core/config/api.config';
import { AiHistoryService, AiHistoryItem } from '../../../../../core/services/ai-history.service';

@Component({
  selector: 'app-pmdt17a',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    SicButtonComponent,
    SicVersionBadgeComponent,
    SicComboboxComponent,
    SicInputComponent,
    SicDatepickerComponent,
    SicTimepickerComponent,
    SicTiptapEditorComponent,
  ],
  templateUrl: './pmdt17A.component.html',
  styleUrls: ['./pmdt17A.component.css'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class Pmdt17AComponent implements OnInit, CanComponentDeactivate {
  private service = inject(Pmdt17AService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private dialog = inject(DialogService);
  private customerState = inject(CustomerStateService);
  private businessService = inject(BusinessService);
  private approvalService = inject(ApprovalService);
  private aiHistoryService = inject(AiHistoryService);

  formData!: SicFromData<PmMaTicketModel>;
  id = signal<string | null>(null);
  isSaving = signal(false);
  isEdit = signal(false);
  isView = signal(false);
  isLocked = signal(false);

  // Approval Flow
  approvalFlowsApi = `${apiBaseUrl}/api/pm/approvals/flows/document-type/MA_TICKET`;
  flows = signal<ApprovalFlow[]>([]);
  selectedFlowId = signal<string | null>(null);
  isLoadingFlows = signal(false);

  ticketTypeOptions = [
    { value: 'BUG_SUPPORT', label: 'แจ้งปัญหาระบบ' },
    { value: 'DATA_ISSUE', label: 'ข้อมูลผิดพลาด' },
    { value: 'USER_SUPPORT', label: 'การใช้งานผู้ใช้' },
    { value: 'CHANGE_REQUEST', label: 'ขอปรับเปลี่ยน' },
  ];

  severityOptions = [
    { value: 'LOW', label: 'ต่ำ (ภายใน 48 ชม.)' },
    { value: 'MEDIUM', label: 'ปานกลาง (ภายใน 24 ชม.)' },
    { value: 'HIGH', label: 'สูง (ภายใน 8 ชม.)' },
    { value: 'CRITICAL', label: 'วิกฤต (ภายใน 2 ชม.)' },
  ];

  statusOptions = [
    { value: 'OPEN', label: 'เปิดรับเรื่อง' },
    { value: 'IN_PROGRESS', label: 'กำลังดำเนินการ' },
    { value: 'WAITING_CUSTOMER', label: 'รอลูกค้า' },
    { value: 'RESOLVED', label: 'แก้ไขเรียบร้อย' },
    { value: 'CLOSED', label: 'ปิดงาน' },
  ];

  apiMembersCombobox = `${apiBaseUrl}/api/business/combobox-members`;
  businessId = this.businessService.getCurrentBusinessId();

  // AI Assistant State
  showAiModal = signal(false);
  isGeneratingAi = signal(false);
  aiAssistTab = signal<'generate' | 'history'>('generate');
  aiModel = signal('gemini-2.5-flash-lite');
  aiPrompt = signal('');
  aiTicketType = signal('BUG_SUPPORT');
  aiPriority = signal('MEDIUM');
  aiModels = [
    { id: 'gemini-2.5-flash-lite', name: '⚡ Gemini 2.5 Flash Lite' },
    { id: 'gemini-2.5-flash', name: '✨ Gemini 2.5 Flash' },
    { id: 'claude-3-5-sonnet', name: '🧠 Claude 3.5 Sonnet' },
    { id: 'claude-3-7-sonnet', name: '🤖 Claude 3.7 Sonnet' },
  ];
  aiHistories = signal<AiHistoryItem[]>([]);
  aiCurrentDraft = signal<any | null>(null);
  aiCurrentVersionNo = signal<number | null>(null);
  copiedId = signal<string | null>(null);

  isSaved = false;
  pageDirty = () => this.isSaved ? false : (this.formData?.isChanged ?? false);

  loadAiHistory(): void {
    const targetId = this.id() || (this.formData?.form?.value as any)?.id || 'new';
    this.aiHistories.set(this.aiHistoryService.getHistories('ma_ticket', targetId));
  }

  deleteAiHistory(id: string, e: MouseEvent): void {
    e.stopPropagation();
    const targetId = this.id() || (this.formData?.form?.value as any)?.id || 'new';
    this.dialog.confirm('ยืนยันการลบ', 'คุณต้องการลบประวัติการสร้างนี้หรือไม่?').then((ok: boolean) => {
      if (ok) {
        this.aiHistoryService.deleteHistory('ma_ticket', targetId, id);
        this.loadAiHistory();
      }
    });
  }

  clearAllAiHistory(): void {
    const targetId = this.id() || (this.formData?.form?.value as any)?.id || 'new';
    this.dialog.confirm('ยืนยันการล้างประวัติ', 'คุณต้องการล้างประวัติการสร้างทั้งหมดของตั๋วนี้หรือไม่?').then((ok: boolean) => {
      if (ok) {
        this.aiHistoryService.clearHistories('ma_ticket', targetId);
        this.loadAiHistory();
      }
    });
  }

  openAiModal(): void {
    if (this.isLocked() || this.isView()) {
      this.dialog.warn('ไม่สามารถดำเนินการได้', 'เอกสารนี้อยู่ในโหมดดูข้อมูลหรือถูกล็อคแล้ว');
      return;
    }
    const currentType = (this.formData?.form?.value as any)?.ticketType || 'BUG_SUPPORT';
    const currentSev = (this.formData?.form?.value as any)?.severity || 'MEDIUM';
    this.aiTicketType.set(currentType);
    this.aiPriority.set(currentSev);
    this.aiPrompt.set('');
    this.aiAssistTab.set('generate');
    this.loadAiHistory();
    this.showAiModal.set(true);
  }

  closeAiModal(): void {
    if (this.isGeneratingAi()) return;
    this.showAiModal.set(false);
  }

  generateWithAi(): void {
    if (this.isGeneratingAi()) return;

    const projId = (this.formData?.form?.value as any)?.projectId || this.customerState.getProjectId();
    const currentTitle = (this.formData?.form?.value as any)?.title;
    const targetId = this.id() || (this.formData?.form?.value as any)?.id || 'new';

    this.isGeneratingAi.set(true);

    this.service.generateDraft({
      projectId: projId || undefined,
      title: currentTitle || undefined,
      ticketType: this.aiTicketType() || undefined,
      priority: this.aiPriority() || undefined,
      prompt: this.aiPrompt() || undefined,
      model: this.aiModel() || undefined,
    }).subscribe({
      next: (draft) => {
        this.isGeneratingAi.set(false);
        if (!draft) {
          this.dialog.warn('ไม่พบข้อมูล', 'AI ไม่สามารถสร้างเนื้อหาตั๋วได้ กรุณาลองใหม่อีกครั้ง');
          return;
        }

        const historyItem = this.aiHistoryService.addHistory(
          'ma_ticket',
          targetId,
          draft,
          this.aiPrompt(),
          this.aiModel()
        );

        this.aiCurrentDraft.set(draft);
        this.aiCurrentVersionNo.set(historyItem.versionNo);
        this.loadAiHistory();
        this.dialog.success('สร้างเนื้อหาสำเร็จ', `AI ได้ร่างข้อมูลตั๋วแจ้งปัญหา (เวอร์ชัน v${historyItem.versionNo}) เรียบร้อยแล้ว`);
      },
      error: (err) => {
        this.isGeneratingAi.set(false);
        console.error('AI ma ticket generation error:', err);
        this.dialog.error('เกิดข้อผิดพลาด', err?.error?.message || err?.message || 'ไม่สามารถสร้างเนื้อหาด้วย AI ได้');
      },
    });
  }

  pasteMaTicketDraft(draft: any): void {
    if (this.isLocked() || this.isView()) {
      this.dialog.warn('ไม่สามารถดำเนินการได้', 'เอกสารนี้อยู่ในโหมดดูข้อมูลหรือถูกล็อคแล้ว');
      return;
    }
    if (!draft) {
      this.dialog.warn('ไม่พบข้อมูล', 'ไม่มีข้อมูลที่จะวางลงในฟอร์ม');
      return;
    }

    if (draft.title) {
      this.formData.patchValue({ title: draft.title } as any);
    }
    if (draft.description) {
      this.formData.patchValue({ description: draft.description } as any);
    }
    if (draft.rootCause) {
      this.formData.patchValue({ rootCause: draft.rootCause } as any);
    }
    if (draft.resolution) {
      this.formData.patchValue({ resolution: draft.resolution } as any);
    }
    if (draft.ticketType) {
      this.formData.patchValue({ ticketType: draft.ticketType } as any);
    }
    if (draft.priority) {
      this.formData.patchValue({ severity: draft.priority } as any);
    }

    this.formData.markAsDirty();
    this.showAiModal.set(false);
    this.dialog.success('นำข้อมูลลงฟอร์มสำเร็จ', 'ข้อมูล MA Ticket จาก AI ถูกใส่ลงในฟอร์มเรียบร้อยแล้ว');
  }

  copyDraft(draft: any, historyId?: string): void {
    if (!draft) return;
    const text = typeof draft === 'string' ? draft : JSON.stringify(draft, null, 2);
    navigator.clipboard.writeText(text).then(() => {
      this.copiedId.set(historyId || 'current');
      setTimeout(() => this.copiedId.set(null), 2000);
    });
  }

  ngOnInit() {
    const rawForm = Pmdt17AForm.createForm(this.fb);
    this.formData = new SicFromData<PmMaTicketModel>(rawForm);

    const isViewRoute = this.router.url.includes('/view');
    if (isViewRoute) {
      this.isView.set(true);
    }

    this.loadApprovalFlows();

    const projId = this.customerState.getProjectId();
    const custId = this.customerState.getCustomerId();
    if (projId || custId) {
      this.formData.patchValue({
        ...(projId ? { projectId: projId } : {}),
        ...(custId ? { customerId: custId } : {}),
      } as any);
    }

    this.route.params.subscribe((params) => {
      const paramId = params['id'];
      if (paramId) {
        this.id.set(paramId);
      }
      const isViewRoute = this.router.url.includes('/view');
      const isEditRoute = this.router.url.includes('/edit');
      this.isView.set(isViewRoute);
      this.isEdit.set(isEditRoute || (!isViewRoute && !!paramId));
      if (this.isView()) {
        this.formData?.form.disable();
      } else {
        this.formData?.form.enable();
      }
      if (paramId) {
        this.loadData(paramId);
      }
    });
  }

  loadApprovalFlows(): void {
    this.isLoadingFlows.set(true);
    this.approvalService.getFlowsByDocumentType('MA_TICKET').subscribe({
      next: (flows) => {
        this.flows.set(flows);
        this.isLoadingFlows.set(false);
      },
      error: () => {
        this.isLoadingFlows.set(false);
      },
    });
  }

  loadData(id: string) {
    this.service.getById(id).subscribe({
      next: (data) => {
        this.formData.form.patchValue(data);
        if (data.isLocked) {
          this.isLocked.set(true);
          this.isView.set(true);
        } else {
          this.isLocked.set(false);
          this.isView.set(this.router.url.includes('/view'));
        }
        if (this.isView()) {
          this.formData.form.disable();
        } else {
          this.formData.form.enable();
        }
        this.formData.resetModel(this.formData.form.getRawValue() as any);
      },
      error: (err) => {
        this.dialog.error('เกิดข้อผิดพลาด', err.message || 'ไม่สามารถโหลดข้อมูลตั๋วได้');
      },
    });
  }

  goToEditMode(): void {
    if (this.id() && !this.isLocked()) {
      this.isView.set(false);
      this.isEdit.set(true);
      this.formData?.form.enable();
      this.router.navigate(['/feature/pm/ma-ticket', this.id(), 'edit']);
    }
  }

  requestChange(): void {
    const projectId = this.formData?.form.get('projectId')?.value;
    this.router.navigate(['/feature/pm/change-request/new'], {
      queryParams: {
        projectId,
        targetType: 'MA_TICKET',
        targetId: this.id(),
        targetTitle: this.formData?.form.get('title')?.value,
      },
    });
  }

  submit() {
    this.formData.form.markAllAsTouched();
    if (this.formData.invalid) {
      this.dialog.warn('กรุณากรอกข้อมูล', 'โปรดตรวจสอบข้อมูลในฟอร์มให้ครบถ้วน');
      return;
    }

    this.isSaving.set(true);
    const rawVal = this.formData.form.getRawValue();
    const targetId = this.id() || rawVal.id;
    const isEditMode = !!targetId || this.isEdit();
    const formValue = {
      ...rawVal,
      id: targetId || undefined,
      state: isEditMode ? SicEntityState.Modified : SicEntityState.Added,
    };
    this.service.save(formValue).subscribe({
      next: (res: any) => {
        const savedId = res?.id || (typeof res === 'string' ? res : null) || this.id();
        if (this.selectedFlowId() && savedId) {
          this.approvalService.submitForApproval({
            documentType: 'MA_TICKET',
            documentId: savedId,
            documentCode: formValue.ticketNo,
            documentTitle: formValue.title || (formValue.ticketNo ? ('MA Ticket ' + formValue.ticketNo) : 'MA Ticket'),
            flowId: this.selectedFlowId()!,
            comment: 'ส่งขออนุมัติปิดตั๋ว/ดำเนินงาน MA Ticket'
          }).subscribe({
            next: () => {
              this.isSaving.set(false);
              this.isSaved = true;
              this.formData.markAsPristine();
              this.dialog.success('บันทึกสำเร็จ', 'บันทึกข้อมูลตั๋วแจ้งปัญหา MA เรียบร้อย');
              this.router.navigate(['/feature/pm/ma-ticket']);
            },
            error: (err) => {
              this.isSaving.set(false);
              this.isSaved = true;
              this.formData.markAsPristine();
              this.dialog.success('บันทึกสำเร็จ', 'บันทึกข้อมูลตั๋วแจ้งปัญหา MA เรียบร้อย');
              this.router.navigate(['/feature/pm/ma-ticket']);
            }
          });
        } else {
          this.isSaving.set(false);
          this.isSaved = true;
          this.formData.markAsPristine();
          this.dialog.success('บันทึกสำเร็จ', 'บันทึกข้อมูลตั๋วแจ้งปัญหา MA เรียบร้อย');
          this.router.navigate(['/feature/pm/ma-ticket']);
        }
      },
      error: (err) => {
        this.isSaving.set(false);
        this.dialog.error('เกิดข้อผิดพลาด', err.message || 'ไม่สามารถบันทึกข้อมูลได้');
      },
    });
  }

  onBack() {
    this.router.navigate(['/feature/pm/ma-ticket']);
  }
}
