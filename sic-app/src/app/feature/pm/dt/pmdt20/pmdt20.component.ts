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
import { CanComponentDeactivate } from '../../../../core/guard/can-deactivate.guard';
import { DialogService } from '../../../../core/services/dialog.service';
import { SicFromData } from '../../../../core/model/sic-from-data';
import { SicEntityState } from '../../../../core/model/sic-base-model';

import { Pmdt20Service } from './pmdt20.service';
import { Pmdt20Form } from './pmdt20.form';
import { PmInvoiceModel } from './pmdt20.model';
import { apiBaseUrl } from '../../../../core/config/api.config';

@Component({
  selector: 'app-pmdt20',
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
  ],
  templateUrl: './pmdt20.component.html',
})
export class Pmdt20Component implements OnInit, CanComponentDeactivate {
  private service = inject(Pmdt20Service);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private dialog = inject(DialogService);

  formData!: SicFromData<PmInvoiceModel>;
  id = signal<string | null>(null);
  isSaving = signal(false);

  billingTypeOptions = [
    { value: 'FIXED_PRICE', label: 'Fixed Price' },
    { value: 'MILESTONE', label: 'Milestone Billing' },
    { value: 'MONTHLY', label: 'Monthly Billing' },
    { value: 'MA', label: 'MA Billing' },
    { value: 'CHANGE_REQUEST', label: 'Change Request Billing' },
  ];

  apiCustomerCombobox = `${apiBaseUrl}/api/pm/customers/combobox`;
  apiProjectCombobox = `${apiBaseUrl}/api/pm/customer-projects/combobox`;

  dataResource = httpResource<PmInvoiceModel>(() =>
    this.id() ? `${apiBaseUrl}/api/pm/invoices/${this.id()}` : undefined
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
    this.formData = new SicFromData<PmInvoiceModel>(Pmdt20Form.createForm(this.fb));

    const idParam = this.route.snapshot.params['id'];
    if (idParam) {
      this.id.set(idParam);
    } else {
      this.formData.form.patchValue({ state: SicEntityState.Added });
    }

    this.formData.form.get('subtotalAmount')?.valueChanges.subscribe((subtotal) => {
      this.calculateTotal(subtotal || 0);
    });

    this.formData.form.get('vatRate')?.valueChanges.subscribe((vatRate) => {
      const subtotal = this.formData.form.get('subtotalAmount')?.value || 0;
      this.calculateTotal(subtotal, vatRate || 0);
    });
  }

  calculateTotal(subtotal: number, vatRate = 7.0) {
    const vat = (subtotal * vatRate) / 100;
    const total = subtotal + vat;
    this.formData.form.patchValue({ vatAmount: vat, totalAmount: total }, { emitEvent: false });
  }

  onBack(): void {
    this.router.navigate(['/feature/pm/invoice']);
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
        this.dialog.success('บันทึกสำเร็จ', 'บันทึกข้อมูลใบแจ้งหนี้เรียบร้อย');
        this.formData.form.markAsPristine();
        this.router.navigate(['/feature/pm/invoice']);
      },
      error: (err) => {
        this.dialog.error('เกิดข้อผิดพลาด', err.message || 'บันทึกข้อมูลไม่สำเร็จ');
      },
      complete: () => this.isSaving.set(false),
    });
  }
}

export default Pmdt20Component;