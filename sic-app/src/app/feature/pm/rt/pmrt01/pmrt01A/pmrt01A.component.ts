// src/app/feature/pm/rt/pmrt01A/pmrt01A.component.ts

import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs';

import { CustomerModel } from './pmrt01A.model';
import { Pmrt01AService } from './pmrt01A.service';
import { Pmrt01AForm } from './pmrt01A.form';
import { SicProfileComponent } from '../../../../../core/component/sic-profile/sic-profile.component';
import { SicRadioComponent } from '../../../../../core/component/sic-radio/sic-radio.component';
import { SicButtonComponent } from '../../../../../core/component/sic-button/sic-button.component';
import { SicComboboxComponent } from '../../../../../core/component/sic-combobox/sic-combobox.component';
import { SicInputComponent } from '../../../../../core/component/sic-input/sic-input.component';
import { SicInputAreaComponent } from '../../../../../core/component/sic-input-area/sic-input-area.component';
import { SicInputPhoneComponent } from '../../../../../core/component/sic-input-phone/sic-input-phone.component';
import type { CanComponentDeactivate } from '../../../../../core/guard/can-deactivate.guard';
// ✅ เปลี่ยนจาก import type เป็น import ปกติ
import { SicFromData } from '../../../../../core/model/sic-from-data';
import { DialogService } from '../../../../../core/services/dialog.service';

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
  // ✅ เปลี่ยนเป็น public เพื่อใช้ใน HTML
  public service = inject(Pmrt01AService);
  private dialog = inject(DialogService);
  private fb = inject(FormBuilder);

  formCustomerData!: SicFromData<CustomerModel>;
  isEdit = false;
  customerId: string | null = null;
  isLoading = false;
  businessId = '';

  pageDirty = () => this.formCustomerData?.dirty ?? false;

  ngOnInit(): void {
    // ดึง businessId จาก localStorage
    this.businessId = localStorage.getItem('businessId') || '';
    if (!this.businessId) {
      this.dialog.error('ไม่พบธุรกิจ', 'กรุณาเลือกธุรกิจก่อน');
      this.router.navigate(['/management/business']);
      return;
    }

    // สร้างฟอร์ม
    const form = Pmrt01AForm.createForm(this.fb);
    this.formCustomerData = new SicFromData<CustomerModel>(form);

    // ตรวจสอบว่าเป็นโหมดแก้ไขหรือไม่
    this.route.params.subscribe((params) => {
      const id = params['id'];
      if (id) {
        this.isEdit = true;
        this.customerId = id;
        this.loadCustomer(id);
      }
    });
  }

  loadCustomer(id: string) {
    this.isLoading = true;
    this.service
      .getCustomer(id)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (data) => {
          this.formCustomerData.formGroup.patchValue(data);
          console.log('✅ โหลดข้อมูลลูกค้าสำเร็จ:', data);
        },
        error: (err) => {
          console.error('❌ โหลดข้อมูลไม่สำเร็จ:', err);
          this.dialog.error('โหลดข้อมูลไม่สำเร็จ', 'ไม่พบข้อมูลลูกค้ารหัสนี้');
          this.router.navigate(['/feature/pm/customer']);
        },
      });
  }

  // ---- Event Handlers สำหรับ Combobox (จังหวัด/อำเภอ/ตำบล) ----
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
    // ✅ ตรวจสอบว่า event.zipCode มีค่า ก่อน set
    const zipCode = event?.zipCode ?? null;
    this.formCustomerData.formGroup.get('zipCode')?.setValue(zipCode);
  }

  onBack(): void {
    this.router.navigate(['/feature/pm/customer']);
  }

  submit() {
    this.formCustomerData.markAllAsTouched();
    if (this.formCustomerData.invalid) {
      this.dialog.warn('ฟอร์มไม่ถูกต้อง', 'กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง');
      return;
    }

    const data = this.formCustomerData.value as CustomerModel;

    if (this.isEdit && this.customerId) {
      // แก้ไข
      this.service.updateCustomer(this.customerId, data).subscribe({
        next: () => {
          this.dialog.success('บันทึกสำเร็จ', 'ข้อมูลลูกค้าถูกบันทึกเรียบร้อย').then(() => {
            this.formCustomerData.markAsPristine();
            this.router.navigate(['/feature/pm/customer']);
          });
        },
        error: (err) => {
          this.dialog.error('บันทึกไม่สำเร็จ', err.error?.message || 'เกิดข้อผิดพลาด');
        },
      });
    } else {
      // สร้างใหม่
      this.service.createCustomer(this.businessId, data).subscribe({
        next: () => {
          this.dialog.success('บันทึกสำเร็จ', 'ข้อมูลลูกค้าถูกบันทึกเรียบร้อย').then(() => {
            this.formCustomerData.markAsPristine();
            this.router.navigate(['/feature/pm/customer']);
          });
        },
        error: (err) => {
          this.dialog.error('บันทึกไม่สำเร็จ', err.error?.message || 'เกิดข้อผิดพลาด');
        },
      });
    }
  }
}