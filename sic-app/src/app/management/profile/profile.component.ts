import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, forkJoin, map } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../core/auth/auth.service';
import { SicButtonComponent } from 'sic-ng';
import { SicComboboxComponent } from '../../core/component/sic-combobox/sic-combobox.component';
import { SicInputAreaComponent } from 'sic-ng';
import { SicInputPhoneComponent } from 'sic-ng';
import { SicInputComponent } from '../../core/component/sic-input/sic-input.component';
import { SicProfileComponent } from '../../core/component/sic-profile/sic-profile.component';
import { SicFromData } from '../../core/model/sic-from-data';
import { DialogService } from '../../core/services/dialog.service';
import { EmailVerifyModel, ProfileFormData, ProfileModel } from './profile.model';
import { ProfileService } from './profile.service';

@Component({
  selector: 'app-profile',
  imports: [
    CommonModule,
    SicProfileComponent,
    ReactiveFormsModule,
    SicComboboxComponent,
    SicInputComponent,
    SicInputPhoneComponent,
    SicButtonComponent,
    SicInputAreaComponent,
    TranslateModule,
  ],
  templateUrl: './profile.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './profile.component.css',
})
export class Profile implements OnInit {
  readonly route = inject(ActivatedRoute);
  readonly dialog = inject(DialogService);
  readonly authService = inject(AuthService);
  readonly service = inject(ProfileService);
  readonly router = inject(Router);
  readonly translate = inject(TranslateService);
  private readonly cdr = inject(ChangeDetectorRef);

  formProfileData!: SicFromData<ProfileModel>;
  formVerifyData!: SicFromData<EmailVerifyModel>;

  readonly showProfile = signal(true);
  isVerifying = signal(false);

  // ✅ เก็บค่าเริ่มต้นของทุกฟิลด์ที่ต้องตรวจสอบ
  private originalEmail: string = '';
  private originalPhone: string = '';
  private originalTaxId: string = '';

  // Map field names to display labels
  private get fieldLabels(): Record<string, string> {
    return {
      email: this.translate.instant('PROFILE_EMAIL_LABEL'),
      phoneNumber: this.translate.instant('PROFILE_PHONE_LABEL'),
      taxId: this.translate.instant('PROFILE_TAXID_SHORT_LABEL'),
    };
  }

  ngOnInit(): void {
    const form: ProfileFormData = this.route.snapshot.data['form'];
    this.formProfileData = form.profile;
    this.formVerifyData = form.verify;

    // ✅ เก็บค่าเริ่มต้นของทุกฟิลด์
    this.originalEmail = this.formProfileData.formGroup.get('email')?.value || '';
    this.originalPhone = this.formProfileData.formGroup.get('phoneNumber')?.value || '';
    this.originalTaxId = this.formProfileData.formGroup.get('taxId')?.value || '';

    // ✅ ตรวจสอบและกำหนดค่า supportLocalAddress เมื่อเปิดหน้าจอ
    const hasLocal = !!(
      this.formProfileData.formGroup.get('supportLocalAddress')?.value ||
      this.formProfileData.formGroup.get('provinceId')?.value ||
      this.formProfileData.value?.provinceId
    );
    if (hasLocal) {
      this.formProfileData.formGroup.get('supportLocalAddress')?.setValue(true);
    } else {
      const countryId = this.formProfileData.formGroup.get('countryId')?.value;
      if (countryId) {
        this.service.getCountryById(countryId).subscribe({
          next: (res: any) => {
            const item = Array.isArray(res) ? res[0] : (res?.data?.[0] ?? res);
            if (item?.supportLocalAddress) {
              this.formProfileData.formGroup.get('supportLocalAddress')?.setValue(true);
              this.cdr.markForCheck();
            }
          },
          error: () => {}
        });
      }
    }
  }

  onCountryChange(event: any): void {
    const supportLocal = !!event?.supportLocalAddress;
    this.formProfileData.formGroup.get('supportLocalAddress')?.setValue(supportLocal);
    this.formProfileData.formGroup.get('provinceId')?.setValue(null);
    this.formProfileData.formGroup.get('districtId')?.setValue(null);
    this.formProfileData.formGroup.get('subDistrictId')?.setValue(null);
    this.formProfileData.formGroup.get('zipCode')?.setValue(null);
  }

  onProvinceChange(event: any): void {
    this.formProfileData.formGroup.get('districtId')?.setValue(null);
    this.formProfileData.formGroup.get('subDistrictId')?.setValue(null);
    this.formProfileData.formGroup.get('zipCode')?.setValue(null);
  }

  onDistrictChange(event: any): void {
    this.formProfileData.formGroup.get('subDistrictId')?.setValue(null);
    this.formProfileData.formGroup.get('zipCode')?.setValue(null);
  }

  onSubDistrictChange(event: any): void {
    this.formProfileData.formGroup.get('zipCode')?.setValue(event?.zipCode ?? null);
  }

  verifyEmail(): void {
    if (
      this.formProfileData.formGroup.get('email')?.dirty &&
      this.formProfileData.formGroup.get('email')?.valid
    ) {
      const email = this.formProfileData.formGroup.get('email')?.value;
      if (email) {
        this.service.sendVerifyToken(email).subscribe({
          next: (generateVerifyToken: EmailVerifyModel) => {
            this.showProfile.set(false);
            this.formVerifyData.formGroup.patchValue({
              referenceNumber: generateVerifyToken.referenceNumber,
              verifyToken: generateVerifyToken.verifyToken,
              recipient: generateVerifyToken.recipient,
            });
            this.dialog.success(
              this.translate.instant('PROFILE_VERIFY_EMAIL_SENT_TITLE'),
              this.translate.instant('PROFILE_VERIFY_EMAIL_SENT_MSG'),
            );
          },
          error: (error) => {
            this.dialog.error(this.translate.instant('PROFILE_SEND_EMAIL_FAIL_TITLE'), error?.message || this.translate.instant('PROFILE_SEND_EMAIL_FAIL_MSG'));
          },
        });
      }
    }
  }

  resend() {
    const email = this.formProfileData.formGroup.get('email')?.value;
    if (email) {
      this.service.sendVerifyToken(email).subscribe({
        next: (generateVerifyToken: EmailVerifyModel) => {
          this.formVerifyData.formGroup.patchValue({
            referenceNumber: generateVerifyToken.referenceNumber,
            verifyToken: generateVerifyToken.verifyToken,
            recipient: generateVerifyToken.recipient,
          });
          this.dialog.success(this.translate.instant('PROFILE_RESEND_SUCCESS_TITLE'), this.translate.instant('PROFILE_RESEND_SUCCESS_MSG'));
        },
        error: (error) => {
          this.dialog.error(this.translate.instant('PROFILE_RESEND_FAIL_TITLE'), error?.message || this.translate.instant('PROFILE_RESEND_FAIL_MSG'));
        },
      });
    }
  }

  back() {
    this.showProfile.set(true);
  }

  // ✅ ตรวจสอบความซ้ำเฉพาะฟิลด์ที่มีการเปลี่ยนแปลง
  private checkDuplicates(): Promise<boolean> {
    return new Promise((resolve) => {
      const currentEmail = this.formProfileData.formGroup.get('email')?.value || '';
      const currentPhone = this.formProfileData.formGroup.get('phoneNumber')?.value || '';
      const currentTaxId = this.formProfileData.formGroup.get('taxId')?.value || '';

      const checks: any[] = [];

      // ✅ เฉพาะ Email ที่เปลี่ยนแปลง
      if (currentEmail && this.originalEmail !== currentEmail) {
        checks.push(
          this.service.checkEmail(currentEmail).pipe(
            map((isAvailable: boolean) => ({
              field: 'email',
              isAvailable,
            })),
          ),
        );
      }

      // ✅ เฉพาะ Phone ที่เปลี่ยนแปลง
      if (currentPhone && this.originalPhone !== currentPhone) {
        checks.push(
          this.service.checkPhone(currentPhone).pipe(
            map((isAvailable: boolean) => ({
              field: 'phoneNumber',
              isAvailable,
            })),
          ),
        );
      }

      // ✅ เฉพาะ Tax ID ที่เปลี่ยนแปลง
      if (currentTaxId && this.originalTaxId !== currentTaxId) {
        checks.push(
          this.service.checkTaxId(currentTaxId).pipe(
            map((isAvailable: boolean) => ({
              field: 'taxId',
              isAvailable,
            })),
          ),
        );
      }

      if (checks.length === 0) {
        resolve(true);
        return;
      }

      forkJoin(checks).subscribe({
        next: (results) => {
          let hasError = false;
          const duplicateFields: string[] = [];

          results.forEach((result) => {
            const control = this.formProfileData.formGroup.get(result.field);
            if (!result.isAvailable) {
              control?.setErrors({ duplicate: true });
              hasError = true;
              duplicateFields.push(this.fieldLabels[result.field] || result.field);
            } else {
              const errors = control?.errors;
              if (errors && errors['duplicate']) {
                delete errors['duplicate'];
                if (Object.keys(errors).length === 0) {
                  control?.setErrors(null);
                }
              }
            }
          });

          if (hasError) {
            const fieldMessages = duplicateFields.map((f) => this.translate.instant('PROFILE_ALREADY_IN_USE', { field: f }));
            const message = fieldMessages.join(', ');
            this.dialog.warn(this.translate.instant('PROFILE_DUPLICATE_DATA_TITLE'), message);
            resolve(false);
          } else {
            resolve(true);
          }
        },
        error: () => {
          this.dialog.error(this.translate.instant('PROFILE_CHECK_ERROR_TITLE'), this.translate.instant('PROFILE_CHECK_ERROR_MSG'));
          resolve(false);
        },
      });
    });
  }

  // ✅ submit() – ตรวจสอบความซ้ำก่อนไป Verify
  async submit() {
    this.formProfileData.markAllAsTouched();

    if (this.formProfileData.invalid) {
      this.dialog.warn(this.translate.instant('PROFILE_FORM_INCOMPLETE_TITLE'), this.translate.instant('PROFILE_FORM_INCOMPLETE_MSG'));
      return;
    }

    if (this.formProfileData.isNotChanged) {
      this.router.navigate(['feature']);
      return;
    }

    // ✅ ตรวจสอบความซ้ำของทุกฟิลด์ที่เปลี่ยนแปลง
    const isAllValid = await this.checkDuplicates();
    if (!isAllValid) {
      return;
    }

    // ✅ ใช้การเปรียบเทียบค่าแทนการใช้ dirty
    const currentEmail = this.formProfileData.formGroup.get('email')?.value;
    const isEmailChanged = this.originalEmail !== currentEmail;

    if (isEmailChanged) {
      this.verifyEmail();
    } else {
      this.save();
    }
  }

  verify() {
    // ✅ ป้องกันการกดซ้ำ
    if (this.isVerifying()) {
      return;
    }

    this.formVerifyData.markAllAsTouched();
    if (this.formVerifyData.invalid) {
      this.dialog.warn(this.translate.instant('PROFILE_FORM_INCOMPLETE_TITLE'), this.translate.instant('PROFILE_VERIFY_CODE_INVALID_MSG'));
      return;
    }

    this.isVerifying.set(true);
    this.save();
  }

  // ✅ save() – บันทึกและจัดการ Error
  save() {
    const data = this.formProfileData.value;
    data.referenceNumber = this.formVerifyData.value.referenceNumber;
    data.verifyToken = this.formVerifyData.value.verifyToken;

    this.isVerifying.set(true);
    this.service.save(data)
      .pipe(finalize(() => this.isVerifying.set(false)))
      .subscribe({
        next: (response: any) => {
          if (response?.success === false || response?.error) {
            const errorMessage = response?.message || response?.error || this.translate.instant('PROFILE_SAVE_FAILED_MSG');
            this.handleSaveError(errorMessage);
            return;
          }

          this.dialog.success(this.translate.instant('PROFILE_SAVE_SUCCESS_TITLE'), this.translate.instant('PROFILE_SAVE_SUCCESS_MSG')).then(() => {
            this.router.navigate(['feature']);
          });
        },
        error: (error) => {
          const errorMessage = error?.error?.message || error?.message || this.translate.instant('PROFILE_SAVE_FAILED_MSG');
          this.handleSaveError(errorMessage);
        },
      });
  }

  // ✅ จัดการ Error ทั้งหมด
  private handleSaveError(errorMessage: string): void {
    const lowerMsg = errorMessage?.toLowerCase() || '';

    // 1. Token ถูกใช้ไปแล้ว
    if (lowerMsg.includes('token already used')) {
      this.dialog
        .warn(this.translate.instant('PROFILE_TOKEN_USED_TITLE'), this.translate.instant('PROFILE_TOKEN_USED_MSG'))
        .then(() => {
          this.showProfile.set(false);
          this.resend();
        });
      return;
    }

    // 2. Token หมดอายุ
    if (lowerMsg.includes('token expired')) {
      this.dialog.warn(this.translate.instant('PROFILE_TOKEN_EXPIRED_TITLE'), this.translate.instant('PROFILE_TOKEN_EXPIRED_MSG')).then(() => {
        this.showProfile.set(false);
        this.resend();
      });
      return;
    }

    // 3. Invalid reference number or token
    if (
      lowerMsg.includes('invalid reference number') ||
      lowerMsg.includes('invalid token') ||
      lowerMsg.includes('invalid reference') ||
      lowerMsg.includes('reference number or token')
    ) {
      this.dialog.warn(
        this.translate.instant('PROFILE_INVALID_CODE_TITLE'),
        this.translate.instant('PROFILE_INVALID_CODE_MSG'),
      );
      return;
    }

    // 4. ข้อมูลซ้ำ (Email, Phone, Tax ID)
    const duplicateFields: string[] = [];

    if (lowerMsg.includes('email')) {
      this.formProfileData.formGroup.get('email')?.setErrors({ duplicate: true });
      duplicateFields.push(this.translate.instant('PROFILE_EMAIL_LABEL'));
    }
    if (lowerMsg.includes('phone number') || lowerMsg.includes('เบอร์โทร')) {
      this.formProfileData.formGroup.get('phoneNumber')?.setErrors({ duplicate: true });
      duplicateFields.push(this.translate.instant('PROFILE_PHONE_LABEL'));
    }
    if (lowerMsg.includes('tax id') || lowerMsg.includes('เลขประจำตัว')) {
      this.formProfileData.formGroup.get('taxId')?.setErrors({ duplicate: true });
      duplicateFields.push(this.translate.instant('PROFILE_TAXID_SHORT_LABEL'));
    }

    let displayMessage = this.translate.instant('PROFILE_SAVE_FAILED_MSG');
    if (duplicateFields.length > 0) {
      const fieldMessages = duplicateFields.map((f) => this.translate.instant('PROFILE_ALREADY_IN_USE', { field: f }));
      displayMessage = fieldMessages.join(', ');
    } else {
      displayMessage = errorMessage || this.translate.instant('PROFILE_SAVE_FAILED_MSG');
    }

    this.dialog.error(this.translate.instant('PROFILE_SAVE_FAILED_TITLE'), displayMessage);
  }
}
