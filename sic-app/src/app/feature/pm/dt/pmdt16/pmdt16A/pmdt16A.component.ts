import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AI_MODEL_OPTIONS, DEFAULT_AI_MODEL } from '../../../../../core/config/ai-models.config';
import { ReactiveFormsModule, FormBuilder, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { finalize } from 'rxjs';

import { SicButtonComponent } from 'sic-ng';
import { SicVersionBadgeComponent } from '../../../../../core/component/sic-version-badge/sic-version-badge.component';
import { SicComboboxComponent } from '../../../../../core/component/sic-combobox/sic-combobox.component';
import { SicInputComponent } from 'sic-ng';
import { SicInputNumberComponent } from 'sic-ng';
import { SicTiptapEditorComponent } from '../../../../../core/component/sic-tiptap-editor/sic-tiptap-editor.component';
import { SicDatepickerComponent } from 'sic-ng';
import { SicUploadComponent } from '../../../../../core/component/sic-upload/sic-upload.component';
import { ApprovalService } from '../../pmdt03/approval.service';
import type { ApprovalFlow } from '../../pmdt03/approval.model';
import { CanComponentDeactivate } from '../../../../../core/guard/can-deactivate.guard';
import { DialogService } from '../../../../../core/services/dialog.service';
import { LanguageService } from '../../../../../core/services/language.service';
import { CustomerStateService } from '../../../../../core/services/customer-state.service';
import { SicFromData } from '../../../../../core/model/sic-from-data';

import { Pmdt16AForm } from './pmdt16A.form';
import { Pmdt16AService } from './pmdt16A.service';
import { PmInvoiceModel, PmInvoiceItemModel } from './pmdt16A.model';
import { Pmdt16APageData } from './pmdt16A.resolver';
import { SicEntityState } from '../../../../../core/model/sic-base-model';
import { apiBaseUrl } from '../../../../../core/config/api.config';
import { AiHistoryService, AiHistoryItem } from '../../../../../core/services/ai-history.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { smartPatchFormAiDraft } from '../../../../../core/utils/ai-form-patch.util';
import { AiAttachmentPayload, filesToAiAttachments } from '../../../../../core/utils/ai-attachment.util';
import { tryAiAutoOpen } from '../../../../../core/utils/ai-navigator-deeplink.util';
import { SicAiAttachmentPickerComponent } from '../../../../../core/component/sic-ai-attachment-picker/sic-ai-attachment-picker.component';

@Component({
  selector: 'app-pmdt16a',
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
    SicInputNumberComponent,
    SicTiptapEditorComponent,
    SicDatepickerComponent,
    SicUploadComponent,
    TranslateModule,
    SicAiAttachmentPickerComponent,
  ],
  templateUrl: './pmdt16A.component.html',
  styleUrls: ['./pmdt16A.component.css'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class Pmdt16AComponent implements OnInit, CanComponentDeactivate {
  private service = inject(Pmdt16AService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private dialog = inject(DialogService);
  private customerState = inject(CustomerStateService);
  private approvalService = inject(ApprovalService);
  private http = inject(HttpClient);
  private languageService = inject(LanguageService);
  private aiHistoryService = inject(AiHistoryService);
  private translate = inject(TranslateService);

  formData!: SicFromData<PmInvoiceModel>;
  id = signal<string | null>(null);
  isSaving = signal(false);
  isEdit = signal(false);
  isView = signal(false);
  isLocked = signal(false);
  isPrinting = signal(false);

  contractOptions = signal<Array<{ value: string; text: string }>>([]);
  deliveryOptions = signal<Array<{ value: string; text: string }>>([]);
  isProjectDerived = signal(false);
  apiGetComboboxProject = `${apiBaseUrl}/api/pm/customer-projects/combobox`;
  items = signal<PmInvoiceItemModel[]>([]);

  // Approval Flow
  approvalFlowsApi = `${apiBaseUrl}/api/pm/approvals/flows/document-type/INVOICE`;
  flows = signal<ApprovalFlow[]>([]);
  selectedFlowId = signal<string | null>(null);
  isLoadingFlows = signal(false);

  get billingTypeOptions() {
    return [
      { value: 'FIXED_PRICE', label: this.translate.instant('PMDT16A_BILL_FIXED') },
      { value: 'MILESTONE', label: this.translate.instant('PMDT16A_BILL_MILESTONE') },
      { value: 'MONTHLY', label: this.translate.instant('PMDT16A_BILL_MONTHLY') },
      { value: 'MA', label: this.translate.instant('PMDT16A_BILL_MA') },
      { value: 'CHANGE_REQUEST', label: this.translate.instant('PMDT16A_BILL_CR') },
    ];
  }

  get paymentStatusOptions() {
    return [
      { value: 'UNPAID', label: this.translate.instant('PMDT16A_PAY_UNPAID') },
      { value: 'PARTIAL', label: this.translate.instant('PMDT16A_PAY_PARTIAL') },
      { value: 'PAID', label: this.translate.instant('PMDT16A_PAY_PAID') },
      { value: 'OVERDUE', label: this.translate.instant('PMDT16A_PAY_OVERDUE') },
    ];
  }

  // AI Assistant State
  showAiModal = signal(false);
  isGeneratingAi = signal(false);
  aiAssistTab = signal<'generate' | 'history'>('generate');
  aiModel = signal(DEFAULT_AI_MODEL);
  aiPrompt = signal('');
  aiBillingType = signal('FIXED_PRICE');
  aiModels = AI_MODEL_OPTIONS;
  aiHistories = signal<AiHistoryItem[]>([]);
  aiCurrentDraft = signal<any | null>(null);
  aiCurrentVersionNo = signal<number | null>(null);
  copiedId = signal<string | null>(null);
  aiAttachedFiles = signal<File[]>([]);

  isSaved = false;
  pageDirty = () => this.isSaved ? false : (this.formData?.isChanged ?? false);

  loadAiHistory(): void {
    const targetId = this.id() || (this.formData?.form?.value as any)?.id || 'new';
    this.aiHistories.set(this.aiHistoryService.getHistories('invoice', targetId));
  }

  deleteAiHistory(id: string, e: MouseEvent): void {
    e.stopPropagation();
    const targetId = this.id() || (this.formData?.form?.value as any)?.id || 'new';
    this.dialog.confirm(this.translate.instant('PMDT16A_CONFIRM_DELETE_TITLE'), this.translate.instant('PMDT16A_CONFIRM_DELETE_HIST_MSG')).then((ok: boolean) => {
      if (ok) {
        this.aiHistoryService.deleteHistory('invoice', targetId, id);
        this.loadAiHistory();
      }
    });
  }

  clearAllAiHistory(): void {
    const targetId = this.id() || (this.formData?.form?.value as any)?.id || 'new';
    this.dialog.confirm(this.translate.instant('PMDT16A_CONFIRM_CLEAR_TITLE'), this.translate.instant('PMDT16A_CONFIRM_CLEAR_MSG')).then((ok: boolean) => {
      if (ok) {
        this.aiHistoryService.clearHistories('invoice', targetId);
        this.loadAiHistory();
      }
    });
  }

  openAiModal(): void {
    if (this.isLocked() || this.isView()) {
      this.dialog.warn(this.translate.instant('PMDT16A_LOCKED_WARN_TITLE'), this.translate.instant('PMDT16A_LOCKED_WARN_MSG'));
      return;
    }
    const currentType = (this.formData?.form?.value as any)?.billingType || 'FIXED_PRICE';
    this.aiBillingType.set(currentType);
    this.aiPrompt.set('');
    this.aiAssistTab.set('generate');
    this.loadAiHistory();
    this.showAiModal.set(true);
  }

  closeAiModal(): void {
    if (this.isGeneratingAi()) return;
    this.showAiModal.set(false);
  }

  async generateWithAi(): Promise<void> {
    if (this.isGeneratingAi()) return;

    const projId = (this.formData?.form?.value as any)?.projectId || this.customerState.getProjectId();
    const contractId = (this.formData?.form?.value as any)?.contractId;
    const targetId = this.id() || (this.formData?.form?.value as any)?.id || 'new';

    this.isGeneratingAi.set(true);

    let attachments: AiAttachmentPayload[] = [];
    if (this.aiAttachedFiles().length) {
      attachments = await filesToAiAttachments(this.aiAttachedFiles());
    }

    this.service.generateDraft({
      projectId: projId || undefined,
      contractId: contractId || undefined,
      invoiceType: this.aiBillingType() || undefined,
      prompt: this.aiPrompt() || undefined,
      model: this.aiModel() || undefined,
      attachments,
    }).subscribe({
      next: (draft) => {
        this.isGeneratingAi.set(false);
        if (!draft) {
          this.dialog.warn(this.translate.instant('PMDT16A_NO_DATA_TITLE'), this.translate.instant('PMDT16A_NO_DATA_AI_MSG'));
          return;
        }

        const historyItem = this.aiHistoryService.addHistory(
          'invoice',
          targetId,
          draft,
          this.aiPrompt(),
          this.aiModel()
        );

        this.aiCurrentDraft.set(draft);
        this.aiCurrentVersionNo.set(historyItem.versionNo);
        this.loadAiHistory();

        // ดึงข้อมูลหัวข้อ/ประเภท หมายเหตุ (Tiptap) อัตราภาษี และรายการสินค้าลงในฟอร์มทันที
        this.applyDraftToForm(draft);

        this.dialog.success(this.translate.instant('PMDT16A_GEN_SUCCESS_TITLE'), this.translate.instant('PMDT16A_GEN_SUCCESS_MSG', { v: historyItem.versionNo }));
      },
      error: (err) => {
        this.isGeneratingAi.set(false);
        console.error('AI invoice generation error:', err);
        this.dialog.error(this.translate.instant('PMDT16A_ERROR_TITLE'), err?.error?.message || err?.message || this.translate.instant('PMDT16A_AI_ERROR_MSG'));
      },
    });
  }

  private applyDraftToForm(draft: any): void {
    if (!draft) return;

    // Smart Preserve: กรอกเฉพาะช่องที่ผู้ใช้ยังไม่ได้กรอก ห้ามเขียนทับสิ่งที่ผู้ใช้พิมพ์ไว้แล้ว
    smartPatchFormAiDraft(
      this.formData.form,
      {
        billingType: draft.billingType || draft.invoiceType,
        vatRate: draft.vatRate !== undefined && draft.vatRate !== null
          ? Number(draft.vatRate)
          : (draft.taxRate !== undefined && draft.taxRate !== null ? Number(draft.taxRate) : undefined),
        remark: draft.remark || draft.notes,
        subtotalAmount: (!draft.items || draft.items.length === 0) && draft.amount !== undefined && draft.amount !== null
          ? Number(draft.amount)
          : undefined,
      },
      ['id'],
      { billingType: this.billingTypeOptions },
    );

    if (draft.items && Array.isArray(draft.items) && draft.items.length > 0) {
      const newItems = draft.items.map((it: any, idx: number) => ({
        id: undefined,
        itemNo: idx + 1,
        itemName: it.itemDescription || it.itemName || it.name || this.translate.instant('PMDT16A_DEFAULT_ITEM_NAME', { n: idx + 1 }),
        description: it.description || '',
        quantity: it.quantity || 1,
        unitPrice: it.unitPrice || it.amount || 0,
        amount: it.amount || ((it.quantity || 1) * (it.unitPrice || 0)),
        state: SicEntityState.Added,
      }));
      this.items.set(newItems);
    }

    this.calculateTotals();
    this.formData.markAsDirty();
  }

  pasteInvoiceDraft(draft: any): void {
    if (this.isLocked() || this.isView()) {
      this.dialog.warn(this.translate.instant('PMDT16A_LOCKED_WARN_TITLE'), this.translate.instant('PMDT16A_LOCKED_WARN_MSG'));
      return;
    }
    if (!draft) {
      this.dialog.warn(this.translate.instant('PMDT16A_NO_DATA_TITLE'), this.translate.instant('PMDT16A_NO_DATA_PASTE_MSG'));
      return;
    }

    this.applyDraftToForm(draft);
    this.showAiModal.set(false);
    this.dialog.success(this.translate.instant('PMDT16A_PASTE_SUCCESS_TITLE'), this.translate.instant('PMDT16A_PASTE_SUCCESS_MSG'));
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
    const rawForm = Pmdt16AForm.createForm(this.fb);
    this.formData = new SicFromData<PmInvoiceModel>(rawForm);

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
    this.loadContractOptions(projId || undefined);
    this.loadDeliveryOptions(projId || undefined);

    // Auto calculate VAT & Total
    this.formData.form.get('subtotalAmount')?.valueChanges.subscribe(() => this.calculateTotals());
    this.formData.form.get('vatRate')?.valueChanges.subscribe(() => this.calculateTotals());

    const page: Pmdt16APageData = this.route.snapshot.data['pageData'];
    const paramId = this.route.snapshot.paramMap.get('id');
    if (paramId) {
      this.id.set(paramId);
    }
    const isViewRoute2 = this.router.url.includes('/view');
    const isEditRoute = this.router.url.includes('/edit');
    this.isView.set(isViewRoute2);
    this.isEdit.set(isEditRoute || (!isViewRoute2 && !!paramId));
    if (this.isView()) {
      this.formData?.form.disable();
    } else {
      this.formData?.form.enable();
    }
    if (paramId) {
      if (page?.data) {
        this.applyInvoiceData(page.data);
      } else {
        this.loadData(paramId);
      }
    }

    this.route.queryParams.subscribe((params) => {
      // Global AI Navigator ส่งผู้ใช้มาที่นี่พร้อมสั่งให้เปิด AI Draft Modal และกรอกข้อมูลทันที
      tryAiAutoOpen({
        params,
        router: this.router,
        route: this.route,
        moduleType: 'INVOICE',
        canOpen: () => !this.isView() && !this.isLocked(),
        setPrompt: (p) => this.aiPrompt.set(p),
        open: () => this.openAiModal(),
        generate: () => this.generateWithAi(),
      });
    });
  }

  loadDeliveryOptions(projectId?: string): void {
    this.service.getDeliveryCombobox(projectId).subscribe({
      next: (res) => this.deliveryOptions.set(res || []),
      error: () => this.deliveryOptions.set([]),
    });
  }

  // เลือกโครงการเองจาก Combobox (ไม่ต้องเคยเข้าหน้าโครงการมาก่อน)
  onProjectSelected(item: any): void {
    const projId = item?.value ?? item?.id ?? null;
    this.loadContractOptions(projId || undefined);
    this.loadDeliveryOptions(projId || undefined);
  }

  // เลือก Delivery แล้วผูกโครงการให้อัตโนมัติ (ตัวเลือกหลักตามแผนผังความสัมพันธ์)
  onDeliverySelected(item: any): void {
    const deliveryId = item?.value ?? item?.id ?? null;
    if (!deliveryId) {
      this.isProjectDerived.set(false);
      return;
    }
    this.http.get<any>(`${apiBaseUrl}/api/pm/delivery/${deliveryId}`).subscribe({
      next: (delivery) => {
        const projId = delivery?.projectId;
        if (projId) {
          this.formData.patchValue({ projectId: projId } as any);
          this.isProjectDerived.set(true);
          this.loadContractOptions(projId);
        }
      },
    });
  }

  loadContractOptions(projectId?: string): void {
    this.service.getContractCombobox(projectId).subscribe({
      next: (res) => this.contractOptions.set(res || []),
      error: () => this.contractOptions.set([]),
    });
  }

  private recalcSubtotalFromItems(): void {
    const subtotal = this.items().reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    this.formData.form.get('subtotalAmount')?.setValue(subtotal);
  }

  addItem(): void {
    if (this.isView()) return;
    const list = [...this.items()];
    list.push({
      itemName: '',
      description: '',
      amount: 0,
      sortOrder: list.length + 1,
      state: SicEntityState.Added,
    });
    this.items.set(list);
    this.formData.markAsDirty();
    this.recalcSubtotalFromItems();
  }

  removeItem(index: number): void {
    if (this.isView()) return;
    const list = [...this.items()];
    const item = list[index];
    if (item) {
      if (item.id) {
        item.state = SicEntityState.Deleted;
      } else {
        list.splice(index, 1);
      }
      this.items.set(list);
      this.formData.markAsDirty();
      this.recalcSubtotalFromItems();
    }
  }

  onItemFieldChange(index: number, field: string, value: any): void {
    if (this.isView()) return;
    const list = [...this.items()];
    if (list[index]) {
      (list[index] as any)[field] = field === 'amount' ? (Number(value) || 0) : value;
      if (list[index].state !== SicEntityState.Added) {
        list[index].state = SicEntityState.Modified;
      }
      this.items.set(list);
      this.formData.markAsDirty();
      if (field === 'amount') {
        this.recalcSubtotalFromItems();
      }
    }
  }

  loadApprovalFlows(): void {
    this.isLoadingFlows.set(true);
    this.approvalService.getFlowsByDocumentType('INVOICE').subscribe({
      next: (flows) => {
        this.flows.set(flows);
        this.isLoadingFlows.set(false);
      },
      error: () => {
        this.isLoadingFlows.set(false);
      },
    });
  }

  calculateTotals(): void {
    const subtotal = Number(this.formData.form.get('subtotalAmount')?.value) || 0;
    const vatRate = Number(this.formData.form.get('vatRate')?.value) || 0;
    const vatAmount = Math.round((subtotal * vatRate) / 100 * 100) / 100;
    const total = Math.round((subtotal + vatAmount) * 100) / 100;

    this.formData.form.patchValue({
      vatAmount: vatAmount,
      totalAmount: total,
    }, { emitEvent: false });
  }

  loadData(id: string) {
    this.service.getById(id).subscribe({
      next: (data) => this.applyInvoiceData(data),
      error: (err) => {
        this.dialog.error(this.translate.instant('PMDT16A_ERROR_TITLE'), err.message || this.translate.instant('PMDT16A_LOAD_ERROR_MSG'));
      },
    });
  }

  private applyInvoiceData(data: PmInvoiceModel): void {
    this.formData.form.patchValue(data);
    if (data.items) {
      this.items.set(data.items);
    }
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
    if (data.projectId) {
      this.loadContractOptions(data.projectId);
      this.loadDeliveryOptions(data.projectId);
    }
    this.isProjectDerived.set(!!data.deliveryId);
  }

  goToEditMode(): void {
    if (this.id() && !this.isLocked()) {
      this.isView.set(false);
      this.isEdit.set(true);
      this.formData?.form.enable();
      this.router.navigate(['/feature/pm/invoice', this.id(), 'edit']);
    }
  }

  requestChange(): void {
    const projectId = this.formData?.form.get('projectId')?.value;
    this.router.navigate(['/feature/pm/change-request/new'], {
      queryParams: {
        projectId,
        targetType: 'INVOICE',
        targetId: this.id(),
        targetTitle: this.formData?.form.get('invoiceNo')?.value,
      },
    });
  }

  submit() {
    if (this.isSaving()) return;
    this.formData.form.markAllAsTouched();
    if (this.formData.invalid) {
      this.dialog.warn(this.translate.instant('PMDT16A_VALIDATE_TITLE'), this.translate.instant('PMDT16A_VALIDATE_MSG'));
      return;
    }

    this.isSaving.set(true);
    const rawVal = this.formData.form.getRawValue();
    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const currentId = this.id();
    const targetId = (currentId && UUID_REGEX.test(currentId)) ? currentId : (rawVal.id && UUID_REGEX.test(rawVal.id) ? rawVal.id : undefined);
    const isEditMode = !!targetId || this.isEdit();
    const itemsPayload = this.items().map((item) => {
      const isValidId = item.id && UUID_REGEX.test(item.id);
      return {
        ...item,
        id: isValidId ? item.id : undefined,
        state: item.state !== undefined ? item.state : (isValidId ? SicEntityState.Modified : SicEntityState.Added),
      };
    });
    const formValue = {
      ...rawVal,
      id: targetId || undefined,
      state: isEditMode ? SicEntityState.Modified : SicEntityState.Added,
      items: itemsPayload,
    };
    this.service.save(formValue).subscribe({
      next: (res: any) => {
        const savedId = res?.id || (typeof res === 'string' ? res : null) || this.id();
        if (this.selectedFlowId() && savedId) {
          this.approvalService.submitForApproval({
            documentType: 'INVOICE',
            documentId: savedId,
            documentCode: formValue.invoiceNo,
            documentTitle: formValue.invoiceNo ? (this.translate.instant('PMDT16A_INVOICE_WORD') + ' ' + formValue.invoiceNo) : this.translate.instant('PMDT16A_INVOICE_WORD'),
            flowId: this.selectedFlowId()!,
            comment: this.translate.instant('PMDT16A_SUBMIT_COMMENT')
          }).subscribe({
            next: () => {
              this.isSaving.set(false);
              this.isSaved = true;
              this.formData.markAsPristine();
              this.dialog.success(this.translate.instant('PMDT16A_SAVE_SUCCESS_TITLE'), this.translate.instant('PMDT16A_SAVE_SUCCESS_MSG'));
              this.router.navigate(['/feature/pm/invoice']);
            },
            error: (err) => {
              this.isSaving.set(false);
              this.isSaved = true;
              this.formData.markAsPristine();
              this.dialog.success(this.translate.instant('PMDT16A_SAVE_SUCCESS_TITLE'), this.translate.instant('PMDT16A_SAVE_SUCCESS_MSG'));
              this.router.navigate(['/feature/pm/invoice']);
            }
          });
        } else {
          this.isSaving.set(false);
          this.isSaved = true;
          this.formData.markAsPristine();
          this.dialog.success(this.translate.instant('PMDT16A_SAVE_SUCCESS_TITLE'), this.translate.instant('PMDT16A_SAVE_SUCCESS_MSG'));
          this.router.navigate(['/feature/pm/invoice']);
        }
      },
      error: (err) => {
        this.isSaving.set(false);
        this.dialog.error(this.translate.instant('PMDT16A_ERROR_TITLE'), err.message || this.translate.instant('PMDT16A_SAVE_ERROR_MSG'));
      },
    });
  }

  onBack() {
    this.router.navigate(['/feature/pm/invoice']);
  }

  printPdf(): void {
    const invoiceId = this.id();
    if (!invoiceId) {
      this.dialog.warn(this.translate.instant('PMDT16A_NO_ID_TITLE'), this.translate.instant('PMDT16A_NO_ID_MSG'));
      return;
    }

    this.isPrinting.set(true);
    const url = `${apiBaseUrl}/api/pm/invoices/${invoiceId}/export-pdf`;
    const lang = this.languageService.getCurrentLanguage();
    this.http.get(url, { params: { lang }, responseType: 'blob' })
      .pipe(finalize(() => this.isPrinting.set(false)))
      .subscribe({
        next: (blob) => {
          const pdfBlob = new Blob([blob], { type: 'application/pdf' });
          const pdfUrl = URL.createObjectURL(pdfBlob);
          const printWindow = window.open(pdfUrl, '_blank');
          if (!printWindow) {
            const a = document.createElement('a');
            a.href = pdfUrl;
            a.download = `invoice-${this.formData?.form?.controls['invoiceNo']?.value || invoiceId}.pdf`;
            a.target = '_blank';
            a.click();
          }
        },
        error: (err) => {
          console.error('Export invoice PDF error:', err);
          this.dialog.error(this.translate.instant('PMDT16A_EXPORT_FAIL_TITLE'), this.translate.instant('PMDT16A_EXPORT_FAIL_MSG') + ' ' + (err?.error?.message || err?.message || ''));
        },
      });
  }
}
