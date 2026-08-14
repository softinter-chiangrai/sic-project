import { Component, inject, signal, effect, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { httpResource } from '@angular/common/http';

import { SicButtonComponent } from '../../../../core/component/sic-button/sic-button.component';
import { SicComboboxComponent } from '../../../../core/component/sic-combobox/sic-combobox.component';
import { SicInputComponent } from '../../../../core/component/sic-input/sic-input.component';
import { SicInputNumberComponent } from '../../../../core/component/sic-input-number/sic-input-number.component';
import { SicInputAreaComponent } from '../../../../core/component/sic-input-area/sic-input-area.component';
import { SicDatepickerComponent } from '../../../../core/component/sic-datepicker/sic-datepicker.component';
import { SicUploadComponent } from '../../../../core/component/sic-upload/sic-upload.component';
import { CanComponentDeactivate } from '../../../../core/guard/can-deactivate.guard';
import { DialogService } from '../../../../core/services/dialog.service';
import { SicFromData } from '../../../../core/model/sic-from-data';
import { SicEntityState } from '../../../../core/model/sic-base-model';

import { Pmdt20AService } from './pmdt20A.service';
import { Pmdt20AForm } from './pmdt20A.form';
import { PmPaymentModel } from './pmdt20A.model';
import { apiBaseUrl } from '../../../../core/config/api.config';

@Component({
  selector: 'app-pmdt20A',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    SicButtonComponent,
    SicComboboxComponent,
    SicInputComponent,
    SicInputNumberComponent,
    SicInputAreaComponent,
    SicDatepickerComponent,
    SicUploadComponent,
  ],
  templateUrl: './pmdt20A.component.html',
})
export class Pmdt20AComponent implements OnInit, CanComponentDeactivate {
  private service = inject(Pmdt20AService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private dialog = inject(DialogService);

  formData!: SicFromData<PmPaymentModel>;
  id = signal<string | null>(null);
  isSaving = signal(false);

  paymentMethodOptions = [
    { value: 'BANK_TRANSFER', label: 'Bank Transfer (โอนผ่านธนาคาร)' },
    { value: 'CASH', label: 'Cash (เงินสด)' },
    { value: 'CHEQUE', label: 'Cheque (เช็คสั่งจ่าย)' },
    { value: 'CREDIT_CARD', label: 'Credit Card (บัตรเครดิต)' },
    { value: 'OTHER', label: 'Other (อื่นๆ)' },
  ];

  apiInvoiceCombobox = `${apiBaseUrl}/api/pm/invoices/combobox`;

  dataResource = httpResource<PmPaymentModel>(() =>
    this.id() ? `${apiBaseUrl}/api/pm/payments/${this.id()}` : undefined
  );

  pageDirty = () => this.formData?.dirty ?? false;

  constructor() {
    effect(() => {
      const data = this.dataResource.value();
      if (data) {
        this.formData.form.patchValue(data);
      }
    });
  }

  ngOnInit(): void {
    this.formData = new SicFromData<PmPaymentModel>(Pmdt20AForm.createForm(this.fb));

    const idParam = this.route.snapshot.params['id'];
    if (idParam) {
      this.id.set(idParam);
    } else {
      this.formData.form.patchValue({ state: SicEntityState.Added });
    }
  }

  onBack(): void {
    this.router.navigate(['/feature/pm/payment']);
  }

  submit(): void {
    if (this.formData.invalid) {
      this.formData.markAllAsTouched();
      this.dialog.warn('ข้อมูลไม่ถูกต้อง', 'กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    this.isSaving.set(true);
    const val = this.formData.value;
    if (!val.state) {
      val.state = this.id() ? SicEntityState.Modified : SicEntityState.Added;
    }

    this.service.save(val).subscribe({
      next: () => {
        this.dialog.success('บันทึกสำเร็จ', 'บันทึกข้อมูลการชำระเงินเรียบร้อย');
        this.formData.form.markAsPristine();
        this.router.navigate(['/feature/pm/payment']);
      },
      error: (err) => {
        this.dialog.error('เกิดข้อผิดพลาด', err.message || 'บันทึกข้อมูลไม่สำเร็จ');
      },
      complete: () => this.isSaving.set(false),
    });
  }
}

export default Pmdt20AComponent;