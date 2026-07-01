// src/app/feature/pm/rt/pmrt01/pmrt01A/pmrt01A.component.ts

import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs';

import { SicComboboxComponent } from '../../../../../core/component/sic-combobox/sic-combobox.component';
import { SicProfileComponent } from '../../../../../core/component/sic-profile/sic-profile.component';
import { SicRadioComponent } from '../../../../../core/component/sic-radio/sic-radio.component';
import { CustomerModel } from './pmrt01A.model';
import { Pmrt01AService } from './pmrt01A.service';

import { SicButtonComponent } from '../../../../../core/component/sic-button/sic-button.component';
import { SicInputAreaComponent } from '../../../../../core/component/sic-input-area/sic-input-area.component';
import { SicInputPhoneComponent } from '../../../../../core/component/sic-input-phone/sic-input-phone.component';
import { SicInputComponent } from '../../../../../core/component/sic-input/sic-input.component';
import type { CanComponentDeactivate } from '../../../../../core/guard/can-deactivate.guard';
import { SicFromData } from '../../../../../core/model/sic-from-data';
import { DialogService } from '../../../../../core/services/dialog.service';
import { Pmrt01AForm } from './pmrt01A.form';

@Component({
  selector: 'app-pmrt01a',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    SicProfileComponent,
    SicRadioComponent,
    SicComboboxComponent,
    SicButtonComponent,
    SicInputComponent,
    SicInputAreaComponent,
    SicInputPhoneComponent,
  ],
  templateUrl: './pmrt01A.component.html',
})
export class Pmrt01AComponent implements OnInit, CanComponentDeactivate {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  public service = inject(Pmrt01AService);
  private dialog = inject(DialogService);
  private cdr = inject(ChangeDetectorRef);
  private fb = inject(FormBuilder);

  formCustomerData!: SicFromData<CustomerModel>;
  isEdit = false;
  customerId: string | null = null;
  isLoading = false;
  businessId = '';

  // ✅ Getter สำหรับรูปโปรไฟล์ — อ่านจาก uploadGroupData โดยตรง
  get profileImageUrl(): string {
    const uploadData = this.formCustomerData?.formGroup?.get('uploadGroupData')?.value;
    if (uploadData && Array.isArray(uploadData) && uploadData.length > 0) {
      const first = uploadData[0];
      return first?.accessUrl || 'images/profile.png';
    }
    return 'images/profile.png';
  }

  pageDirty = () => this.formCustomerData?.dirty ?? false;

  ngOnInit(): void {
    this.businessId = localStorage.getItem('businessId') || '';
    if (!this.businessId) {
      this.dialog.error('ไม่พบธุรกิจ', 'กรุณาเลือกธุรกิจก่อน');
      this.router.navigate(['/management/business']);
      return;
    }

    const data = this.route.snapshot.data['form'];
    if (data && data.customer) {
      this.formCustomerData = data.customer;
      this.formCustomerData.formGroup.updateValueAndValidity();
      this.cdr.detectChanges();
    } else {
      const form = Pmrt01AForm.createForm(this.fb);
      this.formCustomerData = new SicFromData<CustomerModel>(form);
      this.cdr.detectChanges();
    }

    this.route.params.subscribe((params) => {
      const id = params['id'];
      if (id) {
        this.isEdit = true;
        this.customerId = id;
        if (!this.formCustomerData.formGroup.get('id')?.value) {
          this.loadCustomer(id);
        }
      }
    });
  }

  loadCustomer(id: string) {
    this.isLoading = true;
    this.service
      .getCustomer(id)
      .pipe(finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (data) => {
          this.formCustomerData.formGroup.patchValue(data);
          this.formCustomerData.formGroup.updateValueAndValidity();
          this.cdr.detectChanges();
        },
        error: () => {
          this.dialog.error('โหลดข้อมูลไม่สำเร็จ', 'ไม่พบข้อมูลลูกค้ารหัสนี้');
          this.router.navigate(['/feature/pm/pmrt01']);
        },
      });
  }

  // ---- Event Handlers ----
  onCountryChange(event: any): void {
    this.formCustomerData.formGroup.get('provinceId')?.setValue(null);
    this.formCustomerData.formGroup.get('districtId')?.setValue(null);
    this.formCustomerData.formGroup.get('subDistrictId')?.setValue(null);
    this.formCustomerData.formGroup.get('zipCode')?.setValue(null);
  }

  onProvinceChange(event: any): void {
    this.formCustomerData.formGroup.get('districtId')?.setValue(null);
    this.formCustomerData.formGroup.get('subDistrictId')?.setValue(null);
    this.formCustomerData.formGroup.get('zipCode')?.setValue(null);
  }

  onDistrictChange(event: any): void {
    this.formCustomerData.formGroup.get('subDistrictId')?.setValue(null);
    this.formCustomerData.formGroup.get('zipCode')?.setValue(null);
  }

  onSubDistrictChange(event: any): void {
    const zipCode = event?.zipCode ?? null;
    this.formCustomerData.formGroup.get('zipCode')?.setValue(zipCode);
  }

  onBack(): void {
    this.router.navigate(['/feature/pm/pmrt01']);
  }

  submit() {
    this.formCustomerData.markAllAsTouched();
    if (this.formCustomerData.invalid) {
      this.dialog.warn('ฟอร์มไม่ถูกต้อง', 'กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง');
      return;
    }

    const uploadData = this.formCustomerData.formGroup.get('uploadGroupData')?.value;
    if (uploadData && Array.isArray(uploadData) && uploadData.length > 0) {
      const firstUpload = uploadData[0];
      if (firstUpload?.uploadGroupId) {
        this.formCustomerData.formGroup.patchValue({
          uploadGroupId: firstUpload.uploadGroupId,
        });
      }
    }

    const data = this.formCustomerData.value as CustomerModel;

    if (this.isEdit && this.customerId) {
      this.service.updateCustomer(this.customerId, data).subscribe({
        next: () => {
          this.dialog.success('บันทึกสำเร็จ', 'ข้อมูลลูกค้าถูกบันทึกเรียบร้อย').then(() => {
            this.formCustomerData.markAsPristine();
            this.router.navigate(['/feature/pm/pmrt01']);
          });
        },
        error: (err) => {
          this.dialog.error('บันทึกไม่สำเร็จ', err.error?.message || 'เกิดข้อผิดพลาด');
        },
      });
    } else {
      this.service.createCustomer(this.businessId, data).subscribe({
        next: () => {
          this.dialog.success('บันทึกสำเร็จ', 'ข้อมูลลูกค้าถูกบันทึกเรียบร้อย').then(() => {
            this.formCustomerData.markAsPristine();
            this.router.navigate(['/feature/pm/pmrt01']);
          });
        },
        error: (err) => {
          this.dialog.error('บันทึกไม่สำเร็จ', err.error?.message || 'เกิดข้อผิดพลาด');
        },
      });
    }
  }
}