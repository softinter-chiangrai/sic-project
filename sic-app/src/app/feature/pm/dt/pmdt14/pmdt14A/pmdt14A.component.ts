import { CommonModule } from '@angular/common';
import { Component, inject, signal, effect, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { SicButtonComponent } from '../../../../../core/component/sic-button/sic-button.component';
import { SicVersionBadgeComponent } from '../../../../../core/component/sic-version-badge/sic-version-badge.component';
import { SicComboboxComponent } from '../../../../../core/component/sic-combobox/sic-combobox.component';
import { SicInputAreaComponent } from '../../../../../core/component/sic-input-area/sic-input-area.component';
import { SicInputComponent } from '../../../../../core/component/sic-input/sic-input.component';
import { SicDatepickerComponent } from '../../../../../core/component/sic-datepicker/sic-datepicker.component';
import { SicUploadComponent } from '../../../../../core/component/sic-upload/sic-upload.component';
import { SicTiptapEditorComponent } from '../../../../../core/component/sic-tiptap-editor/sic-tiptap-editor.component';
import { CanComponentDeactivate } from '../../../../../core/guard/can-deactivate.guard';
import { DialogService } from '../../../../../core/services/dialog.service';
import { CustomerStateService } from '../../../../../core/services/customer-state.service';
import { SicFromData } from '../../../../../core/model/sic-from-data';
import { SicEntityState } from '../../../../../core/model/sic-base-model';

import { Pmdt14AForm } from './pmdt14A.form';
import { Pmdt14AService } from './pmdt14A.service';
import { PmDeliveryModel, PmDeliveryChecklistModel, PmDeliveryGateCheckResponse } from './pmdt14A.model';
import { ApprovalService } from '../../pmdt03/approval.service';
import { apiBaseUrl } from '../../../../../core/config/api.config';
import { ApprovalFlow } from '../../pmdt03/approval.model';
import { AiHistoryService, AiHistoryItem } from '../../../../../core/services/ai-history.service';

@Component({
  selector: 'app-pmdt14a',
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
    SicInputAreaComponent,
    SicDatepickerComponent,
    SicUploadComponent,
    SicTiptapEditorComponent,
  ],
  templateUrl: './pmdt14A.component.html',
  styleUrls: ['./pmdt14A.component.css'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class Pmdt14AComponent implements OnInit, CanComponentDeactivate {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly service = inject(Pmdt14AService);
  private readonly dialog = inject(DialogService);
  private readonly fb = inject(FormBuilder);
  private readonly customerState = inject(CustomerStateService);
  private readonly approvalService = inject(ApprovalService);
  private readonly aiHistoryService = inject(AiHistoryService);

  formData!: SicFromData<PmDeliveryModel>;
  id = signal<string | null>(null);
  isEdit = signal(false);
  isView = signal(false);
  isLocked = signal(false);
  isSaving = signal(false);

  // Approval Flow
  approvalFlowsApi = `${apiBaseUrl}/api/pm/approvals/flows/document-type/DELIVERY`;
  flows = signal<ApprovalFlow[]>([]);
  selectedFlowId = signal<string | null>(null);
  isLoadingFlows = signal(false);

  gateCheckData = signal<PmDeliveryGateCheckResponse | null>(null);
  isLoadingGateCheck = signal(false);

  checklists = signal<PmDeliveryChecklistModel[]>([]);
  contractOptions = signal<Array<{ value: string; text: string }>>([]);

  // Delivery options
  typeOptions = [
    { label: 'ส่งมอบงวดสุดท้าย', value: 'FINAL' },
    { label: 'ส่งมอบบางส่วน', value: 'PARTIAL' },
    { label: 'ส่งมอบตามงวดงาน', value: 'MILESTONE' },
  ];

  statusOptions = [
    { label: 'ฉบับร่าง', value: 'DRAFT' },
    { label: 'กำลังเตรียมเอกสาร', value: 'PREPARING' },
    { label: 'พร้อมส่งมอบ', value: 'READY' },
    { label: 'ส่งมอบแล้ว', value: 'DELIVERED' },
    { label: 'ลูกค้ายืนยันรับมอบ', value: 'CONFIRMED' },
  ];

  // AI Assistant State
  showAiModal = signal(false);
  isGeneratingAi = signal(false);
  aiAssistTab = signal<'generate' | 'history'>('generate');
  aiModel = signal('gemini-2.5-flash-lite');
  aiPrompt = signal('');
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
  pageDirty = () => this.isView() ? false : (this.isSaved ? false : (this.formData?.isChanged ?? false));

  loadAiHistory(): void {
    const targetId = this.id() || (this.formData?.form?.value as any)?.id || 'new';
    this.aiHistories.set(this.aiHistoryService.getHistories('delivery', targetId));
  }

  deleteAiHistory(id: string, e: MouseEvent): void {
    e.stopPropagation();
    const targetId = this.id() || (this.formData?.form?.value as any)?.id || 'new';
    this.dialog.confirm('ยืนยันการลบ', 'คุณต้องการลบประวัติการสร้างนี้หรือไม่?').then((ok: boolean) => {
      if (ok) {
        this.aiHistoryService.deleteHistory('delivery', targetId, id);
        this.loadAiHistory();
      }
    });
  }

  clearAllAiHistory(): void {
    const targetId = this.id() || (this.formData?.form?.value as any)?.id || 'new';
    this.dialog.confirm('ยืนยันการล้างประวัติ', 'คุณต้องการล้างประวัติการสร้างทั้งหมดของเอกสารส่งมอบนี้หรือไม่?').then((ok: boolean) => {
      if (ok) {
        this.aiHistoryService.clearHistories('delivery', targetId);
        this.loadAiHistory();
      }
    });
  }

  openAiModal(): void {
    if (this.isLocked() || this.isView()) {
      this.dialog.warn('ไม่สามารถดำเนินการได้', 'เอกสารนี้อยู่ในโหมดดูข้อมูลหรือถูกล็อคแล้ว');
      return;
    }
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
    const currentTitle = (this.formData?.form?.value as any)?.deliveryTitle;
    const targetId = this.id() || (this.formData?.form?.value as any)?.id || 'new';

    this.isGeneratingAi.set(true);

    this.service.generateDraft({
      projectId: projId || undefined,
      deliveryName: currentTitle || undefined,
      prompt: this.aiPrompt() || undefined,
      model: this.aiModel() || undefined,
    }).subscribe({
      next: (draft) => {
        this.isGeneratingAi.set(false);
        if (!draft) {
          this.dialog.warn('ไม่พบข้อมูล', 'AI ไม่สามารถสร้างเนื้อหาเอกสารส่งมอบได้ กรุณาลองใหม่อีกครั้ง');
          return;
        }

        const historyItem = this.aiHistoryService.addHistory(
          'delivery',
          targetId,
          draft,
          this.aiPrompt(),
          this.aiModel()
        );

        this.aiCurrentDraft.set(draft);
        this.aiCurrentVersionNo.set(historyItem.versionNo);
        this.loadAiHistory();
        this.dialog.success('สร้างเนื้อหาสำเร็จ', `AI ได้ร่างข้อมูลส่งมอบงาน (เวอร์ชัน v${historyItem.versionNo}) เรียบร้อยแล้ว`);
      },
      error: (err) => {
        this.isGeneratingAi.set(false);
        console.error('AI delivery generation error:', err);
        this.dialog.error('เกิดข้อผิดพลาด', err?.error?.message || err?.message || 'ไม่สามารถสร้างเนื้อหาด้วย AI ได้');
      },
    });
  }

  pasteDeliveryDraft(draft: any): void {
    if (this.isLocked() || this.isView()) {
      this.dialog.warn('ไม่สามารถดำเนินการได้', 'เอกสารนี้อยู่ในโหมดดูข้อมูลหรือถูกล็อคแล้ว');
      return;
    }
    if (!draft) {
      this.dialog.warn('ไม่พบข้อมูล', 'ไม่มีข้อมูลที่จะวางลงในฟอร์ม');
      return;
    }

    if (draft.deliveryName) {
      this.formData.patchValue({ deliveryTitle: draft.deliveryName } as any);
    }
    if (draft.notes) {
      this.formData.patchValue({ notes: draft.notes } as any);
    }

    if (draft.items && Array.isArray(draft.items) && draft.items.length > 0) {
      const newItems: PmDeliveryChecklistModel[] = draft.items.map((it: any, idx: number) => ({
        itemName: typeof it === 'string' ? it : (it.itemName || it.name || `รายการที่ ${idx + 1}`),
        isChecked: false,
        sortOrder: idx + 1,
        state: SicEntityState.Added,
      }));
      this.checklists.set(newItems);
    }

    this.formData.markAsDirty();
    this.showAiModal.set(false);
    this.dialog.success('นำข้อมูลลงฟอร์มสำเร็จ', 'ข้อมูลการส่งมอบจาก AI ถูกใส่ลงในฟอร์มเรียบร้อยแล้ว');
  }

  copyDraft(draft: any, historyId?: string): void {
    if (!draft) return;
    const text = typeof draft === 'string' ? draft : JSON.stringify(draft, null, 2);
    navigator.clipboard.writeText(text).then(() => {
      this.copiedId.set(historyId || 'current');
      setTimeout(() => this.copiedId.set(null), 2000);
    });
  }

  ngOnInit(): void {
    const rawForm = Pmdt14AForm.createForm(this.fb);
    this.formData = new SicFromData<PmDeliveryModel>(rawForm);

    const projId = this.customerState.getProjectId();
    if (projId) {
      this.formData.patchValue({ projectId: projId } as any);
      this.loadContractOptions(projId);
    } else {
      this.loadContractOptions();
    }

    this.loadApprovalFlows();

    this.route.params.subscribe((params) => {
      const isViewUrl = this.router.url.includes('/view');
      this.isView.set(isViewUrl);
      const paramId = params['id'];
      if (paramId) {
        this.id.set(paramId);
        this.isEdit.set(!isViewUrl);
        this.loadData(paramId);
      } else {
        this.id.set(null);
        this.isEdit.set(false);
        this.initDefaultChecklist();
        if (projId) {
          this.runGateCheck(projId);
        }
      }
    });
  }

  loadContractOptions(projectId?: string): void {
    this.service.getContractCombobox(projectId).subscribe({
      next: (res) => {
        this.contractOptions.set(res || []);
      },
      error: () => {
        this.contractOptions.set([]);
      }
    });
  }

  loadApprovalFlows(): void {
    this.isLoadingFlows.set(true);
    this.approvalService.getFlowsByDocumentType('DELIVERY').subscribe({
      next: (flows) => {
        this.flows.set(flows);
        this.isLoadingFlows.set(false);
      },
      error: () => {
        this.isLoadingFlows.set(false);
      }
    });
  }

  loadData(id: string): void {
    this.service.getById(id).subscribe({
      next: (data) => {
        this.formData.form.patchValue({
          ...data,
          id: id,
        });
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
        if (data.checklists) {
          this.checklists.set(data.checklists);
        }
        this.formData.resetModel(this.formData.form.getRawValue() as any);
        if (data.projectId) {
          this.loadContractOptions(data.projectId);
          this.runGateCheck(data.projectId, id);
        }
      },
      error: (err) => {
        this.dialog.error('Error', err.message || 'ไม่สามารถโหลดข้อมูลได้');
      },
    });
  }

  runGateCheck(projectId?: string, deliveryId?: string): void {
    const projId = projectId || this.formData?.form?.controls['projectId']?.value || this.customerState.getProjectId();
    if (!projId) {
      this.dialog.warn('ไม่พบโครงการ', 'กรุณาเลือกโครงการที่ต้องการตรวจสอบเงื่อนไขส่งมอบก่อน');
      return;
    }

    const delId = deliveryId || this.id() || undefined;
    this.isLoadingGateCheck.set(true);
    this.service.getGateCheck(projId, delId).subscribe({
      next: (res) => {
        this.gateCheckData.set(res);
        this.isLoadingGateCheck.set(false);
      },
      error: (err) => {
        this.isLoadingGateCheck.set(false);
        this.dialog.error('เกิดข้อผิดพลาด', err?.error?.message || err?.message || 'ไม่สามารถตรวจสอบเงื่อนไข Gate ได้');
      },
    });
  }

  initDefaultChecklist(): void {
    const defaults: PmDeliveryChecklistModel[] = [
      { itemName: 'Source Code Package & Git Repository Handover', isChecked: false, sortOrder: 1 },
      { itemName: 'Database Migration Script & DDL/DML Package', isChecked: false, sortOrder: 2 },
      { itemName: 'User Manual & Admin Manual (PDF Attached below)', isChecked: false, sortOrder: 3 },
      { itemName: 'Installation Guide & Deployment Architecture Documentation', isChecked: false, sortOrder: 4 },
      { itemName: 'UAT Sign-Off Certificate & Test Execution Summary Report', isChecked: false, sortOrder: 5 },
      { itemName: 'System Credential Sheet & Security Handover Form', isChecked: false, sortOrder: 6 },
    ];
    this.checklists.set(defaults);
  }

  toggleChecklist(index: number): void {
    if (this.isView()) return;
    const list = [...this.checklists()];
    const item = list[index];
    if (item) {
      item.isChecked = !item.isChecked;
      if (item.state !== SicEntityState.Added) {
        item.state = SicEntityState.Modified;
      }
      this.checklists.set(list);
      this.formData.markAsDirty();
    }
  }

  addChecklistItem(): void {
    if (this.isView()) return;
    const list = [...this.checklists()];
    list.push({
      itemName: 'เอกสาร/รายการส่งมอบเพิ่มเติม',
      isChecked: false,
      sortOrder: list.length + 1,
      state: SicEntityState.Added,
    });
    this.checklists.set(list);
    this.formData.markAsDirty();
  }

  removeChecklistItem(index: number): void {
    if (this.isView()) return;
    const list = [...this.checklists()];
    const item = list[index];
    if (item) {
      if (item.id) {
        item.state = SicEntityState.Deleted;
      } else {
        list.splice(index, 1);
      }
      this.checklists.set(list);
      this.formData.markAsDirty();
    }
  }

  goToEditMode(): void {
    if (this.id() && !this.isLocked()) {
      this.isView.set(false);
      this.isEdit.set(true);
      this.formData.form.enable();
      this.router.navigate(['/feature/pm/delivery', this.id(), 'edit']);
    }
  }

  private extractUploadGroupId(rawGroupId: any): string | null {
    if (!rawGroupId) return null;
    if (typeof rawGroupId === 'string') return rawGroupId.trim() || null;
    if (Array.isArray(rawGroupId) && rawGroupId.length > 0) {
      const firstFile = rawGroupId[0];
      if (typeof firstFile === 'string') return firstFile;
      return firstFile?.uploadGroupId || firstFile?.id || firstFile?.uploadId || null;
    }
    if (typeof rawGroupId === 'object') {
      return rawGroupId.uploadGroupId || rawGroupId.id || rawGroupId.uploadId || null;
    }
    return null;
  }

  onSubmit(): void {
    this.formData.form.markAllAsTouched();
    if (this.formData.invalid) {
      this.dialog.warn('กรุณากรอกข้อมูล', 'โปรดตรวจสอบความถูกต้องของฟอร์มส่งมอบ');
      return;
    }

    this.isSaving.set(true);
    const rawForm = this.formData.form.getRawValue();
    const uploadGroupId = this.extractUploadGroupId(rawForm.attachmentGroupId);
    const targetId = this.id() || rawForm.id;
    const isEditMode = !!targetId || this.isEdit();

    const payload: Partial<PmDeliveryModel> = {
      ...rawForm,
      id: targetId || undefined,
      attachmentGroupId: uploadGroupId || undefined,
      checklists: this.checklists(),
      state: isEditMode ? SicEntityState.Modified : SicEntityState.Added,
    };

    this.service.save(payload).subscribe({
      next: (res: any) => {
        const savedId = res?.id || (typeof res === 'string' ? res : null) || this.id();
        if (this.selectedFlowId() && savedId) {
          this.approvalService.submitForApproval({
            documentType: 'DELIVERY',
            documentId: savedId,
            documentCode: payload.deliveryCode,
            documentTitle: payload.deliveryTitle,
            version: payload.deliveryVersion,
            flowId: this.selectedFlowId()!,
            comment: 'ส่งขออนุมัติเอกสารส่งมอบงาน'
          }).subscribe({
            next: () => {
              this.isSaving.set(false);
              this.isSaved = true;
              this.formData.markAsPristine();
              this.dialog.success('บันทึกสำเร็จ', 'บันทึกเอกสารส่งมอบงานเรียบร้อย');
              this.router.navigate(['/feature/pm/delivery']);
            },
            error: (err) => {
              this.isSaving.set(false);
              this.isSaved = true;
              this.formData.markAsPristine();
              this.dialog.success('บันทึกสำเร็จ', 'บันทึกเอกสารส่งมอบงานเรียบร้อย');
              this.router.navigate(['/feature/pm/delivery']);
            }
          });
        } else {
          this.isSaving.set(false);
          this.isSaved = true;
          this.formData.markAsPristine();
          this.dialog.success('บันทึกสำเร็จ', 'บันทึกเอกสารส่งมอบงานเรียบร้อย');
          this.router.navigate(['/feature/pm/delivery']);
        }
      },
      error: (err) => {
        this.isSaving.set(false);
        this.dialog.error('เกิดข้อผิดพลาด', err.message || 'ไม่สามารถบันทึกเอกสารได้');
      },
    });
  }

  navigateToGateModule(category: string): void {
    switch (category?.toUpperCase()) {
      case 'REQUIREMENT':
        this.router.navigate(['/feature/pm/requirement']);
        break;
      case 'SPECIFICATION':
        this.router.navigate(['/feature/pm/specification']);
        break;
      case 'BUG':
        this.router.navigate(['/feature/pm/test-management']);
        break;
      case 'TEST':
        this.router.navigate(['/feature/pm/test-management']);
        break;
      case 'USER_MANUAL':
      case 'MANUAL':
        this.router.navigate(['/feature/pm/manual']);
        break;
      default:
        break;
    }
  }

  onBack(): void {
    this.router.navigate(['/feature/pm/delivery']);
  }

  requestChange(): void {
    const projectId = this.formData?.form.get('projectId')?.value;
    this.router.navigate(['/feature/pm/change-request/new'], {
      queryParams: {
        projectId,
        targetType: 'DELIVERY',
        targetId: this.id(),
        targetTitle: this.formData?.form.get('deliveryTitle')?.value,
      },
    });
  }
}
