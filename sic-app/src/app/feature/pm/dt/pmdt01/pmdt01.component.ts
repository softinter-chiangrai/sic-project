import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { SicButtonComponent } from '../../../../core/component/sic-button/sic-button.component';
import { SicComboboxComponent } from '../../../../core/component/sic-combobox/sic-combobox.component';
import { SicInputAreaComponent } from '../../../../core/component/sic-input-area/sic-input-area.component';
import { SicInputPhoneComponent } from '../../../../core/component/sic-input-phone/sic-input-phone.component';
import { SicInputComponent } from '../../../../core/component/sic-input/sic-input.component';
import { SicProfileComponent } from '../../../../core/component/sic-profile/sic-profile.component';
import { SicRadioComponent } from '../../../../core/component/sic-radio/sic-radio.component';
import type { CanComponentDeactivate } from '../../../../core/guard/can-deactivate.guard';
import { SicFromData } from '../../../../core/model/sic-from-data';
import { DialogService } from '../../../../core/services/dialog.service';
import { Pmdt01Form } from './pmdt01.form';
import { CustomerModel } from './pmdt01.model';
import { Pmdt01Service } from './pmdt01.service';

@Component({
  selector: 'app-pmdt01',
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
  templateUrl: './pmdt01.component.html',
  styles: [], // ✅ เปลี่ยนจาก styleUrl เป็น styles
})
export class Pmdt01Component implements OnInit, CanComponentDeactivate {
  readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);
  readonly service = inject(Pmdt01Service);
  readonly dialog = inject(DialogService);
  private readonly fb = inject(FormBuilder); // ✅ ย้ายมาไว้ที่นี่

  formCustomerData!: SicFromData<CustomerModel>;
  isEdit = false;
  customerId: string | null = null;

  pageDirty = () => this.formCustomerData?.dirty ?? false;

  ngOnInit(): void {
    // รับข้อมูลจาก resolver (ถ้ามี)
    const data = this.route.snapshot.data['form'];
    if (data?.customer) {
      this.formCustomerData = data.customer;
    } else {
      // ✅ ใช้ this.fb แทน inject(FormBuilder)
      const form = Pmdt01Form.createForm(this.fb);
      this.formCustomerData = new SicFromData<CustomerModel>(form);
    }

    // ตรวจสอบว่าเป็นโหมดแก้ไขหรือไม่
    this.route.params.subscribe((params) => {
      const id = params['id'];
      if (id) {
        this.isEdit = true;
        this.customerId = id;
        this.loadCustomer(id);
      }
    });

    // เมื่อเปลี่ยน personType ให้ปรับฟิลด์สาขา
    this.formCustomerData.formGroup.get('personType')?.valueChanges.subscribe((val) => {
      const branchControl = this.formCustomerData.formGroup.get('branchCode');
      if (val === 'CORPORATE') {
        branchControl?.enable();
      } else {
        branchControl?.disable();
        branchControl?.setValue(null);
      }
    });
  }

  onCountryChange(event: any): void {
    this.formCustomerData.formGroup.get('supportLocalAddress')?.setValue(event.supportLocalAddress);
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
    this.formCustomerData.formGroup.get('zipCode')?.setValue(event.zipCode);
  }

  // ✅ แก้ไข onBack
  onBack(): void {
    this.router.navigate(['/feature/pm/pmrt01']);
  }

  // ✅ แก้ไข submit
  submit() {
    this.formCustomerData.markAllAsTouched();
    if (this.formCustomerData.invalid) {
      this.dialog.warn('ฟอร์มไม่ถูกต้อง', 'กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง');
      return;
    }

    const data = this.formCustomerData.value;
    this.service.save(data).subscribe({
      next: (response) => {
        this.dialog.success('บันทึกสำเร็จ', 'ข้อมูลลูกค้าถูกบันทึกเรียบร้อย').then(() => {
          this.formCustomerData.markAsPristine();
          this.router.navigate(['/feature/pm/pmrt01']); // ✅ แก้ไข
        });
      },
      error: (error) => {
        this.dialog.error('บันทึก', error);
      },
    });
  }
  isLoading = false; // เพิ่มไว้ด้านบน

  loadCustomer(id: string) {
    this.isLoading = true; // เริ่มโหลด
    this.service.getCustomer(id).subscribe({
      next: (data) => {
        this.formCustomerData.formGroup.patchValue(data);
        this.isLoading = false;
        console.log('✅ โหลดข้อมูลสำเร็จ:', data);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('❌ โหลดข้อมูลไม่สำเร็จ:', error);
        this.dialog.error('โหลดข้อมูลไม่สำเร็จ', 'ไม่พบข้อมูลลูกค้ารหัสนี้');
        this.router.navigate(['/feature/pm/pmrt01']);
      },
    });
  }
}
