import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { SicButtonComponent } from '../../../../../core/component/sic-button/sic-button.component';
import { SicComboboxComponent } from '../../../../../core/component/sic-combobox/sic-combobox.component';
import { SicInputComponent } from '../../../../../core/component/sic-input/sic-input.component';
import { SicInputNumberComponent } from '../../../../../core/component/sic-input-number/sic-input-number.component';
import { SicInputAreaComponent } from '../../../../../core/component/sic-input-area/sic-input-area.component';
import { SicDatepickerComponent } from '../../../../../core/component/sic-datepicker/sic-datepicker.component';
import { SicUploadComponent } from '../../../../../core/component/sic-upload/sic-upload.component';
import { CanComponentDeactivate } from '../../../../../core/guard/can-deactivate.guard';
import { DialogService } from '../../../../../core/services/dialog.service';
import { CustomerStateService } from '../../../../../core/services/customer-state.service';
import { SicFromData } from '../../../../../core/model/sic-from-data';

import { Pmdt16AForm } from './pmdt16A.form';
import { Pmdt16AService } from './pmdt16A.service';
import { PmInvoiceModel } from './pmdt16A.model';
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
    SicInputAreaComponent,
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

  formData!: SicFromData<PmInvoiceModel>;
  id = signal<string | null>(null);
  isSaving = signal(false);
  isEdit = signal(false);

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

  apiCustomerCombobox = `${apiBaseUrl}/api/pm/customers/lov`;
  apiProjectCombobox = `${apiBaseUrl}/api/pm/projects/lov`;

  isSaved = false;
  pageDirty = () => this.isSaved ? false : (this.formData?.isChanged ?? false);

  ngOnInit() {
    const rawForm = Pmdt16AForm.createForm(this.fb);
    this.formData = new SicFromData<PmInvoiceModel>(rawForm);

    const projId = this.customerState.getProjectId();
    const custId = this.customerState.getCustomerId();
    if (projId || custId) {
      this.formData.patchValue({
        ...(projId ? { projectId: projId } : {}),
        ...(custId ? { customerId: custId } : {}),
      } as any);
    }

    // Auto calculate VAT & Total
    this.formData.form.get('subtotalAmount')?.valueChanges.subscribe(() => this.calculateTotals());
    this.formData.form.get('vatRate')?.valueChanges.subscribe(() => this.calculateTotals());

    const paramId = this.route.snapshot.params['id'];
    if (paramId) {
      this.id.set(paramId);
      this.isEdit.set(true);
      this.loadData(paramId);
    }
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
        this.formData.form.patchValue(data);
        this.formData.resetModel(this.formData.form.getRawValue() as any);
      },
      error: (err) => {
        this.dialog.error('เกิดข้อผิดพลาด', err.message || 'ไม่สามารถโหลดข้อมูลใบแจ้งหนี้ได้');
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
    this.service.save(this.formData.form.getRawValue()).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.isSaved = true;
        this.formData.markAsPristine();
        this.dialog.success('สำเร็จ', 'บันทึกข้อมูลใบแจ้งหนี้และการชำระเงินเรียบร้อย');
        this.router.navigate(['/feature/pm/invoice']);
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
}
