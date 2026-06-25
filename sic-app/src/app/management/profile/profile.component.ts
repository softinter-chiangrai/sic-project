import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, map } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { SicButtonComponent } from '../../core/component/sic-button/sic-button.component';
import { SicComboboxComponent } from '../../core/component/sic-combobox/sic-combobox.component';
import { SicInputAreaComponent } from '../../core/component/sic-input-area/sic-input-area.component';
import { SicInputPhoneComponent } from '../../core/component/sic-input-phone/sic-input-phone.component';
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
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class Profile implements OnInit {
  readonly route = inject(ActivatedRoute);
  readonly dialog = inject(DialogService);
  readonly authService = inject(AuthService);
  readonly service = inject(ProfileService);
  readonly router = inject(Router);

  formProfileData!: SicFromData<ProfileModel>;
  formVerifyData!: SicFromData<EmailVerifyModel>;

  readonly showProfile = signal(true);
  isVerifying = signal(false);

  // ✅ เก็บค่าเริ่มต้นของทุกฟิลด์ที่ต้องตรวจสอบ
  private originalEmail: string = '';
  private originalPhone: string = '';
  private originalTaxId: string = '';

  // Map field names to display labels
  private readonly fieldLabels: Record<string, string> = {
    email: 'อีเมล',
    phoneNumber: 'เบอร์โทรศัพท์',
    taxId: 'เลขประจำตัวผู้เสียภาษี',
  };

  ngOnInit(): void {
    const form: ProfileFormData = this.route.snapshot.data['form'];
    this.formProfileData = form.profile;
    this.formVerifyData = form.verify;

    // ✅ เก็บค่าเริ่มต้นของทุกฟิลด์
    this.originalEmail = this.formProfileData.formGroup.get('email')?.value || '';
    this.originalPhone = this.formProfileData.formGroup.get('phoneNumber')?.value || '';
    this.originalTaxId = this.formProfileData.formGroup.get('taxId')?.value || '';
  }

  onCountryChange(event: any): void {
    this.formProfileData.formGroup.get('supportLocalAddress')?.setValue(event.supportLocalAddress);
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
    this.formProfileData.formGroup.get('zipCode')?.setValue(event.zipCode);
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
              'ส่งอีเมลยืนยันสำเร็จ',
              'เราได้ส่งอีเมลยืนยันไปยังที่อยู่อีเมลของคุณ กรุณาตรวจสอบและปฏิบัติตามคำแนะนำ',
            );
          },
          error: (error) => {
            this.dialog.error('ส่งอีเมลไม่สำเร็จ', error?.message || 'ไม่สามารถส่งอีเมลยืนยันได้');
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
          this.dialog.success('ส่งรหัสยืนยันใหม่สำเร็จ', 'เราได้ส่งรหัสยืนยันใหม่ไปยังอีเมลของคุณ');
        },
        error: (error) => {
          this.dialog.error('ส่งไม่สำเร็จ', error?.message || 'ไม่สามารถส่งรหัสยืนยันใหม่ได้');
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
            const fieldMessages = duplicateFields.map((f) => `${f}นี้ถูกใช้งานแล้ว`);
            const message = fieldMessages.join(', ');
            this.dialog.warn('ข้อมูลซ้ำ', message);
            resolve(false);
          } else {
            resolve(true);
          }
        },
        error: () => {
          this.dialog.error('เกิดข้อผิดพลาด', 'ไม่สามารถตรวจสอบข้อมูลได้');
          resolve(false);
        },
      });
    });
  }

  // ✅ submit() – ตรวจสอบความซ้ำก่อนไป Verify
  async submit() {
    this.formProfileData.markAllAsTouched();

    if (this.formProfileData.invalid) {
      this.dialog.warn('ฟอร์มไม่สมบูรณ์', 'กรุณาแก้ไขข้อมูลที่ผิดพลาดก่อนบันทึก');
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
      this.dialog.warn('ฟอร์มไม่สมบูรณ์', 'กรุณากรอกรหัสยืนยันให้ถูกต้อง');
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

    this.service.save(data).subscribe({
      next: (response: any) => {
        this.isVerifying.set(false);

        if (response?.success === false || response?.error) {
          const errorMessage = response?.message || response?.error || 'ไม่สามารถบันทึกข้อมูลได้';
          this.handleSaveError(errorMessage);
          return;
        }

        this.dialog.success('บันทึกสำเร็จ', 'โปรไฟล์ของคุณถูกบันทึกเรียบร้อย').then(() => {
          this.router.navigate(['feature']);
        });
      },
      error: (error) => {
        this.isVerifying.set(false);
        const errorMessage = error?.error?.message || error?.message || 'ไม่สามารถบันทึกข้อมูลได้';
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
        .warn('Token ถูกใช้ไปแล้ว', 'Token นี้ถูกใช้ไปแล้ว กรุณาส่งรหัสยืนยันใหม่')
        .then(() => {
          this.showProfile.set(false);
          this.resend();
        });
      return;
    }

    // 2. Token หมดอายุ
    if (lowerMsg.includes('token expired')) {
      this.dialog.warn('Token หมดอายุ', 'รหัสยืนยันหมดอายุแล้ว กรุณาส่งรหัสยืนยันใหม่').then(() => {
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
        'รหัสยืนยันไม่ถูกต้อง',
        'รหัสยืนยันที่คุณกรอกไม่ถูกต้อง กรุณาตรวจสอบและลองอีกครั้ง หรือกด "ส่งรหัสยืนยันใหม่" เพื่อรับรหัสใหม่',
      );
      return;
    }

    // 4. ข้อมูลซ้ำ (Email, Phone, Tax ID)
    const duplicateFields: string[] = [];

    if (lowerMsg.includes('email')) {
      this.formProfileData.formGroup.get('email')?.setErrors({ duplicate: true });
      duplicateFields.push('อีเมล');
    }
    if (lowerMsg.includes('phone number') || lowerMsg.includes('เบอร์โทร')) {
      this.formProfileData.formGroup.get('phoneNumber')?.setErrors({ duplicate: true });
      duplicateFields.push('เบอร์โทรศัพท์');
    }
    if (lowerMsg.includes('tax id') || lowerMsg.includes('เลขประจำตัว')) {
      this.formProfileData.formGroup.get('taxId')?.setErrors({ duplicate: true });
      duplicateFields.push('เลขประจำตัวผู้เสียภาษี');
    }

    let displayMessage = 'ไม่สามารถบันทึกข้อมูลได้';
    if (duplicateFields.length > 0) {
      const fieldMessages = duplicateFields.map((f) => `${f}นี้ถูกใช้งานแล้ว`);
      displayMessage = fieldMessages.join(', ');
    } else {
      displayMessage = errorMessage || 'ไม่สามารถบันทึกข้อมูลได้';
    }

    this.dialog.error('บันทึกไม่สำเร็จ', displayMessage);
  }
}
