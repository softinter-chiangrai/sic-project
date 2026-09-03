import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { finalize } from 'rxjs';

import { SicButtonComponent } from '../../../../../core/component/sic-button/sic-button.component';
import { SicComboboxComponent } from '../../../../../core/component/sic-combobox/sic-combobox.component';
import { SicInputComponent } from '../../../../../core/component/sic-input/sic-input.component';
import { SicInputNumberComponent } from '../../../../../core/component/sic-input-number/sic-input-number.component';
import { SicTiptapEditorComponent } from '../../../../../core/component/sic-tiptap-editor/sic-tiptap-editor.component';
import { SicDatepickerComponent } from '../../../../../core/component/sic-datepicker/sic-datepicker.component';
import { SicUploadComponent } from '../../../../../core/component/sic-upload/sic-upload.component';
import { ApprovalService } from '../../pmdt03/approval.service';
import type { ApprovalFlow } from '../../pmdt03/approval.model';
import { CanComponentDeactivate } from '../../../../../core/guard/can-deactivate.guard';
import { DialogService } from '../../../../../core/services/dialog.service';
import { CustomerStateService } from '../../../../../core/services/customer-state.service';
import { SicFromData } from '../../../../../core/model/sic-from-data';

import { Pmdt16AForm } from './pmdt16A.form';
import { Pmdt16AService } from './pmdt16A.service';
import { PmInvoiceModel, PmInvoiceItemModel } from './pmdt16A.model';
import { SicEntityState } from '../../../../../core/model/sic-base-model';
import { apiBaseUrl } from '../../../../../core/config/api.config';

@Component({
  selector: 'app-pmdt16a',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    SicButtonComponent,
    SicComboboxComponent,
    SicInputComponent,
    SicInputNumberComponent,
    SicTiptapEditorComponent,
    SicDatepickerComponent,
    SicUploadComponent,
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

  formData!: SicFromData<PmInvoiceModel>;
  id = signal<string | null>(null);
  isSaving = signal(false);
  isEdit = signal(false);
  isView = signal(false);
  isPrinting = signal(false);

  contractOptions = signal<Array<{ value: string; text: string }>>([]);
  items = signal<PmInvoiceItemModel[]>([]);

  // Approval Flow
  approvalFlowsApi = `${apiBaseUrl}/api/pm/approvals/flows/document-type/INVOICE`;
  flows = signal<ApprovalFlow[]>([]);
  selectedFlowId = signal<string | null>(null);
  isLoadingFlows = signal(false);

  billingTypeOptions = [
    { value: 'FIXED_PRICE', label: 'Fixed Price (งวดราคาคงที่)' },
    { value: 'MILESTONE', label: 'Milestone Billing (งวดงานตาม Milestone)' },
    { value: 'MONTHLY', label: 'Monthly Billing (รายเดือน)' },
    { value: 'MA', label: 'MA Billing (ค่าบำรุงรักษาระบบ)' },
    { value: 'CHANGE_REQUEST', label: 'Change Request (งานส่วนเพิ่ม CR)' },
  ];

  paymentStatusOptions = [
    { value: 'UNPAID', label: 'Unpaid (ยังไม่ชำระ)' },
    { value: 'PARTIAL', label: 'Partial (ชำระบางส่วน)' },
    { value: 'PAID', label: 'Paid (ชำระครบถ้วน)' },
    { value: 'OVERDUE', label: 'Overdue (เกินกำหนดชำระ)' },
  ];

  isSaved = false;
  pageDirty = () => this.isSaved ? false : (this.formData?.isChanged ?? false);

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

    // Auto calculate VAT & Total
    this.formData.form.get('subtotalAmount')?.valueChanges.subscribe(() => this.calculateTotals());
    this.formData.form.get('vatRate')?.valueChanges.subscribe(() => this.calculateTotals());

    const paramId = this.route.snapshot.params['id'];
    if (paramId) {
      this.id.set(paramId);
      this.isEdit.set(!this.isView());
      this.loadData(paramId);
    }
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

  onItemFieldChange(index: number, field: 'itemName' | 'description' | 'amount', value: any): void {
    const list = [...this.items()];
    const item = list[index];
    if (!item) return;
    (item as any)[field] = field === 'amount' ? (Number(value) || 0) : value;
    if (item.state !== SicEntityState.Added) {
      item.state = SicEntityState.Modified;
    }
    this.items.set(list);
    this.formData.markAsDirty();
    if (field === 'amount') {
      this.recalcSubtotalFromItems();
    }
  }

  loadApprovalFlows(): void {
    this.isLoadingFlows.set(true);
    this.approvalService.getFlowsByDocumentType('INVOICE').subscribe({
      next: (flows) => {
        this.flows.set(flows);
        this.isLoadingFlows.set(false);
        if (flows.length === 1 && !this.selectedFlowId()) {
          this.selectedFlowId.set(flows[0].id);
        }
      },
      error: () => {
        this.isLoadingFlows.set(false);
      },
    });
  }

  private calculateTotals(): void {
    const subtotal = Number(this.formData.form.get('subtotalAmount')?.value) || 0;
    const vatRate = Number(this.formData.form.get('vatRate')?.value) || 0;
    const vatAmount = (subtotal * vatRate) / 100;
    const totalAmount = subtotal + vatAmount;

    this.formData.form.get('vatAmount')?.setValue(vatAmount, { emitEvent: false });
    this.formData.form.get('totalAmount')?.setValue(totalAmount, { emitEvent: false });
  }

  loadData(id: string) {
    this.service.getById(id).subscribe({
      next: (data) => {
        const applyData = () => {
          this.formData.form.patchValue(data);
          if (data.items) {
            this.items.set(data.items);
          }
          if (this.isView()) {
            this.formData.form.disable();
          }
          this.formData.resetModel(this.formData.form.getRawValue() as any);
          // Force-resolve the combobox label now that its options are loaded
          this.formData.form.get('contractId')?.setValue(data.contractId ?? null, { emitEvent: false });
        };

        if (data.projectId) {
          this.service.getContractCombobox(data.projectId).subscribe({
            next: (res) => {
              this.contractOptions.set(res || []);
              applyData();
            },
            error: () => {
              this.contractOptions.set([]);
              applyData();
            },
          });
        } else {
          applyData();
        }
      },
      error: (err) => {
        this.dialog.error('เกิดข้อผิดพลาด', err.message || 'ไม่สามารถโหลดข้อมูลใบแจ้งหนี้ได้');
      },
    });
  }

  goToEditMode(): void {
    if (this.id()) {
      this.router.navigate(['/feature/pm/invoice', this.id(), 'edit']);
    }
  }

  submit() {
    this.formData.form.markAllAsTouched();
    if (this.formData.invalid) {
      this.dialog.warn('กรุณากรอกข้อมูล', 'โปรดตรวจสอบข้อมูลในฟอร์มให้ครบถ้วน');
      return;
    }

    this.isSaving.set(true);
    const formValue = { ...this.formData.form.getRawValue(), items: this.items() };
    this.service.save(formValue).subscribe({
      next: (res: any) => {
        const savedId = res?.id || (typeof res === 'string' ? res : null) || this.id();
        if (this.selectedFlowId() && savedId) {
          this.approvalService.submitForApproval({
            documentType: 'INVOICE',
            documentId: savedId,
            documentCode: formValue.invoiceNo,
            documentTitle: formValue.invoiceNo ? ('ใบแจ้งหนี้ ' + formValue.invoiceNo) : 'ใบแจ้งหนี้',
            flowId: this.selectedFlowId()!,
            comment: 'ส่งขออนุมัติใบแจ้งหนี้ (Invoice)'
          }).subscribe({
            next: () => {
              this.isSaving.set(false);
              this.isSaved = true;
              this.formData.markAsPristine();
              this.dialog.success('สำเร็จ', 'บันทึกและส่งขออนุมัติใบแจ้งหนี้เรียบร้อย');
              this.router.navigate(['/feature/pm/invoice']);
            },
            error: (err) => {
              this.isSaving.set(false);
              this.dialog.warn('บันทึกสำเร็จ แต่ส่งขออนุมัติไม่สำเร็จ', err?.error?.message || err?.message || 'เกิดข้อผิดพลาดในการส่งอนุมัติ');
              this.router.navigate(['/feature/pm/invoice']);
            }
          });
        } else {
          this.isSaving.set(false);
          this.isSaved = true;
          this.formData.markAsPristine();
          this.dialog.success('สำเร็จ', 'บันทึกข้อมูลใบแจ้งหนี้และการชำระเงินเรียบร้อย');
          this.router.navigate(['/feature/pm/invoice']);
        }
      },
      error: (err) => {
        this.isSaving.set(false);
        this.dialog.error('เกิดข้อผิดพลาด', err.message || 'ไม่สามารถบันทึกข้อมูลได้');
      },
    });
  }

  onBack() {
    this.router.navigate(['/feature/pm/invoice']);
  }

  printPdf(): void {
    const invoiceId = this.id();
    if (!invoiceId) {
      this.dialog.warn('ไม่พบรหัสใบแจ้งหนี้', 'กรุณาบันทึกใบแจ้งหนี้ก่อนส่งออกเอกสาร');
      return;
    }

    this.isPrinting.set(true);
    const url = `${apiBaseUrl}/api/pm/invoices/${invoiceId}/export-pdf`;
    this.http.get(url, { responseType: 'blob' })
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
          this.dialog.error('ส่งออกเอกสารไม่สำเร็จ', 'ไม่สามารถสร้างรายงาน Jasper Report ได้: ' + (err?.error?.message || err?.message || ''));
        },
      });
  }
}
