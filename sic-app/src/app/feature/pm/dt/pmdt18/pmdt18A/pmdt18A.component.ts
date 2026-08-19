import { Component, inject, signal, effect, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { httpResource } from '@angular/common/http';

import { SicButtonComponent } from '../../../../../core/component/sic-button/sic-button.component';
import { SicComboboxComponent } from '../../../../../core/component/sic-combobox/sic-combobox.component';
import { SicInputComponent } from '../../../../../core/component/sic-input/sic-input.component';
import { SicInputAreaComponent } from '../../../../../core/component/sic-input-area/sic-input-area.component';
import { SicDatepickerComponent } from '../../../../../core/component/sic-datepicker/sic-datepicker.component';
import { CanComponentDeactivate } from '../../../../../core/guard/can-deactivate.guard';
import { DialogService } from '../../../../../core/services/dialog.service';
import { SicFromData } from '../../../../../core/model/sic-from-data';
import { SicEntityState } from '../../../../../core/model/sic-base-model';

import { PmMaRenewalModel } from './pmdt18A.model';
import { Pmdt18AService } from './pmdt18A.service';
import { Pmdt18AForm } from './pmdt18A.form';
import { apiBaseUrl } from '../../../../../core/config/api.config';


@Component({
  selector: 'app-pmdt18a',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    SicButtonComponent,
    SicComboboxComponent,
    SicInputComponent,
    SicInputAreaComponent,
    SicDatepickerComponent,
  ],
  templateUrl: './pmdt18A.component.html',
  styleUrls: ['./pmdt18A.component.css'],
})
export class Pmdt18AComponent implements OnInit, CanComponentDeactivate {
  private service = inject(Pmdt18AService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private dialog = inject(DialogService);

  formData!: SicFromData<PmMaRenewalModel>;
  id = signal<string | null>(null);
  isSaving = signal(false);

  statusOptions = [
    { value: 'DRAFT', label: 'Draft (ร่างข้อเสนอ)' },
    { value: 'PROPOSED', label: 'Proposed (เสนอราคาแล้ว)' },
    { value: 'CONFIRMED', label: 'Confirmed (ตกลงต่อสัญญาแล้ว)' },
    { value: 'REJECTED', label: 'Rejected (ปฏิเสธการต่อสัญญา)' },
    { value: 'EXPIRED', label: 'Expired (หมดอายุสัญญาแล้ว)' },
  ];

  apiContractCombobox = `${apiBaseUrl}/api/pm/customer-contracts/combobox`;
  apiCustomerCombobox = `${apiBaseUrl}/api/pm/customers/combobox`;
  apiProjectCombobox = `${apiBaseUrl}/api/pm/customer-projects/combobox`;

  dataResource = httpResource<PmMaRenewalModel>(() =>
  this.id() ? `${apiBaseUrl}/api/pm/ma-renewals/${this.id()}` : undefined
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
    this.formData = new SicFromData<PmMaRenewalModel>(Pmdt18AForm.createForm(this.fb));

    const idParam = this.route.snapshot.params['id'];
    if (idParam) {
      this.id.set(idParam);
    } else {
      this.formData.form.patchValue({ state: SicEntityState.Added });
    }
  }

  onBack(): void {
    this.router.navigate(['/feature/pm/renewal']);
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
        this.dialog.success('บันทึกสำเร็จ', 'บันทึกข้อมูลข้อเสนอต่อสัญญา MA เรียบร้อย');
        this.formData.form.markAsPristine();
        this.router.navigate(['/feature/pm/renewal']);
      },
      error: (err) => {
        this.dialog.error('เกิดข้อผิดพลาด', err.message || 'บันทึกข้อมูลไม่สำเร็จ');
      },
      complete: () => this.isSaving.set(false),
    });
  }
}

export default Pmdt18AComponent;