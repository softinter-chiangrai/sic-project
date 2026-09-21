// src/app/feature/pm/rt/pmrt01/pmrt01A/pmrt01A.component.ts

import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs';

import { SicComboboxComponent } from '../../../../../core/component/sic-combobox/sic-combobox.component';
import { SicProfileComponent } from '../../../../../core/component/sic-profile/sic-profile.component';
import { SicRadioComponent } from '../../../../../core/component/sic-radio/sic-radio.component';
import { SicTiptapEditorComponent } from '../../../../../core/component/sic-tiptap-editor/sic-tiptap-editor.component';
import { CustomerModel } from './pmrt01A.model';
import { Pmrt01AService } from './pmrt01A.service';

import { environment } from '../../../../../../environments/environment';
import { SicButtonComponent } from 'sic-ng';
import { SicInputAreaComponent } from 'sic-ng';
import { SicInputPhoneComponent } from 'sic-ng';
import { SicInputComponent } from '../../../../../core/component/sic-input/sic-input.component';
import type { CanComponentDeactivate } from '../../../../../core/guard/can-deactivate.guard';
import { SicFromData } from '../../../../../core/model/sic-from-data';
import { DialogService } from '../../../../../core/services/dialog.service';
import { Pmrt01AForm } from './pmrt01A.form';
import { NavigationService } from '../../../../../core/services/navigation.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

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
    SicTiptapEditorComponent,
    TranslateModule,
  ],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './pmrt01A.component.html',
})
export class Pmrt01AComponent implements OnInit, CanComponentDeactivate {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  public service = inject(Pmrt01AService);
  private dialog = inject(DialogService);
  private cdr = inject(ChangeDetectorRef);
  private fb = inject(FormBuilder);
   private navigation = inject(NavigationService);
   private translate = inject(TranslateService);

  formCustomerData!: SicFromData<CustomerModel>;
  isEdit = false;
  customerId: string | null = null;
  isSaving = signal(false);
  businessId = '';

  // ✅ Getter สำหรับรูปโปรไฟล์ — อ่านจาก uploadGroupData โดยตรง
  // pmrt01A.component.ts

  get profileImageUrl(): string {
    const uploadGroupId = this.formCustomerData?.formGroup?.get('uploadGroupId')?.value;
    console.log('🔍 profileImageUrl - uploadGroupId:', uploadGroupId);
    if (uploadGroupId) {
      const url = `${environment.apiBaseUrl}/api/storage/avatar/${uploadGroupId}`;
      console.log('🔍 profileImageUrl - URL:', url);
      return url;
    }
    console.log('🔍 profileImageUrl - fallback to default');
    return 'images/profile.png';
  }

  isSaved = false;
  pageDirty = () => this.isSaved ? false : (this.formCustomerData?.isChanged ?? false);

  ngOnInit(): void {
    this.businessId = localStorage.getItem('businessId') || '';
    if (!this.businessId) {
      this.dialog.error(this.translate.instant('PMRT01A_NO_BUSINESS_TITLE'), this.translate.instant('PMRT01A_NO_BUSINESS_MSG'));
      this.navigation.navigate(['/management/business']);
      return;
    }

    // รับข้อมูลจาก resolver (customerCreateResolver / customerEditResolver โหลดข้อมูลมาให้แล้ว)
    const data = this.route.snapshot.data['form'];
    if (data && data.customer) {
      this.formCustomerData = data.customer;
      this.formCustomerData.formGroup.updateValueAndValidity();
    } else {
      const form = Pmrt01AForm.createForm(this.fb);
      this.formCustomerData = new SicFromData<CustomerModel>(form);
    }
    this.cdr.detectChanges(); // ✅ บังคับให้ view อัปเดต

    // ตรวจสอบว่าเป็นโหมดแก้ไขหรือไม่ (ข้อมูลถูกโหลดมาจาก resolver แล้ว ไม่ต้องยิง HTTP ซ้ำ)
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.customerId = id;
    }
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
    this.navigation.navigate(['/feature/pm/customer']);
  }

  submit() {
    this.formCustomerData.markAllAsTouched();
    if (this.formCustomerData.invalid) {
      this.dialog.warn(this.translate.instant('PMRT01A_INVALID_FORM_TITLE'), this.translate.instant('PMRT01A_INVALID_FORM_MSG'));
      return;
    }

    // ✅ sync uploadGroupId
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

    this.isSaving.set(true);
    const request =
      this.isEdit && this.customerId
        ? this.service.updateCustomer(this.customerId, data)
        : this.service.createCustomer(this.businessId, data);

    request.pipe(finalize(() => this.isSaving.set(false))).subscribe({
      next: () => {
        this.isSaved = true;
        this.formCustomerData.markAsPristine();
        this.dialog.success(this.translate.instant('PMRT01A_SAVE_SUCCESS_TITLE'), this.translate.instant('PMRT01A_SAVE_SUCCESS_MSG')).then(() => {
          this.navigation.navigate(['/feature/pm/customer']);
        });
      },
      error: (err) => {
        this.dialog.error(this.translate.instant('PMRT01A_SAVE_ERROR_TITLE'), err.error?.message || this.translate.instant('PMRT01A_GENERIC_ERROR_MSG'));
      },
    });
  }
}
