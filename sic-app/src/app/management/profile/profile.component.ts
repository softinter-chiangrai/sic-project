import { Component, inject, OnInit, signal } from '@angular/core';
import { SicProfile } from "../../core/component/sic-profile/sic-profile";
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SicCombobox } from "../../core/component/sic-combobox/sic-combobox";
import { ProfileService } from './profile.service';
import { SicInput } from "../../core/component/sic-input/sic-input";
import { SicInputPhone } from "../../core/component/sic-input-phone/sic-input-phone";
import { SicButton } from "../../core/component/sic-button/sic-button";
import { SicFromData } from '../../core/model/sic-from-data';
import { EmailVerifyModel, ProfileFormData, ProfileModel } from './profile.model';
import { DialogService } from '../../core/services/dialog.service';
import { AuthService } from '../../core/auth/auth.service';
import { SicInputArea } from "../../core/component/sic-input-area/sic-input-area";

@Component({
  selector: 'app-profile',
  imports: [CommonModule, SicProfile, ReactiveFormsModule, SicCombobox, SicInput, SicInputPhone, SicButton, SicInputArea],
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

  ngOnInit(): void {
     const form:ProfileFormData = this.route.snapshot.data['form'];
     this.formProfileData = form.profile;
     this.formVerifyData = form.verify;
  }

  onEmailChange(event: Event): void {
    if (this.formProfileData.formGroup.get('email')?.dirty && this.formProfileData.formGroup.get('email')?.valid) {
      const email = this.formProfileData.formGroup.get('email')?.value;
      if (email) {
        this.service.checkEmail(email).subscribe({
          next: (isPass:boolean) => {
            if (!isPass) {
              this.dialog.error('Verification Failed', 'Failed to send verification email. Please try again.');
              this.formProfileData.formGroup.get('email')?.setValue('');
            }
          },
          error: (error) => {
            this.dialog.error('Failed to Send Verification Email', error);
          }
        });
      }
    }
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
    this.formProfileData.formGroup.get('zipCode')?.setValue(event.zipCode);// You can add any logic here if needed when the sub-district changes 
  }

  verifyEmail(): void {
    if (this.formProfileData.formGroup.get('email')?.dirty && this.formProfileData.formGroup.get('email')?.valid) {
      const email = this.formProfileData.formGroup.get('email')?.value;
      if (email) {
        this.service.sendVerifyToken(email).subscribe({
          next: (generateVerifyToken: EmailVerifyModel) => {
            this.showProfile.set(false);
            this.formVerifyData.formGroup.patchValue(generateVerifyToken);
            this.dialog.success('Verification Email Sent', 'A verification email has been sent to your email address. Please check your inbox and follow the instructions to verify your email.');
          },
          error: (error) => {
            this.dialog.error('Failed to Send Verification Email', error.message);
          }
        });
      }
    }
  }

  resend(){
    
  }

  back(){
    this.showProfile.set(true);
  }

  submit() {
    this.formProfileData.markAllAsTouched();
    if (this.formProfileData.invalid) {
      this.dialog.warn('Invalid Form', 'Please correct the errors in the form before saving.');
    } else if (this.formProfileData.isNotChanged) {
      this.router.navigate(['feature']);
    } else if (this.formProfileData.formGroup.get('email')?.dirty) {
      this.verifyEmail();
    } else {
      this.save();
    }
  }

  verify() {
    this.formVerifyData.markAllAsTouched();
    if (this.formVerifyData.invalid) {
      this.dialog.warn('Invalid Form', 'Please correct the errors in the form before saving.');
    } else {
      this.save();
    }
  }

  save() {
    const data = this.formProfileData.value;
    data.referenceNumber = this.formVerifyData.value.referenceNumber;
    data.verifyToken = this.formVerifyData.value.verifyToken;
    this.service.save(data).subscribe({
      next: (response) => {
        this.dialog.success('Profile Saved', 'Your profile has been successfully saved.').then((confirmed) => {
          this.router.navigate(['feature']);
        });
      },
      error: (error) => {
        this.dialog.error('Save Failed', error);
      }
    });
  }
}
