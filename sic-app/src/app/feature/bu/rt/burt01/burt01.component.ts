import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DialogService } from '../../../../core/services/dialog.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { SicFromData } from '../../../../core/model/sic-from-data';
import { Burt01FormData, Burt01Model } from './burt01.model';
import { CommonModule } from '@angular/common';
import { SicProfileComponent } from '../../../../core/component/sic-profile/sic-profile.component';
import { ReactiveFormsModule } from '@angular/forms';
import { SicComboboxComponent } from '../../../../core/component/sic-combobox/sic-combobox.component';
import { SicInputComponent } from '../../../../core/component/sic-input/sic-input.component';
import { SicInputPhoneComponent } from '../../../../core/component/sic-input-phone/sic-input-phone.component';
import { SicButtonComponent } from '../../../../core/component/sic-button/sic-button.component';
import { SicInputAreaComponent } from '../../../../core/component/sic-input-area/sic-input-area.component';
import { Burt01Service } from './burt01.service';
import { SicRadioComponent } from "../../../../core/component/sic-radio/sic-radio.component";

@Component({
  selector: 'app-burt01',
  imports: [CommonModule, SicProfileComponent, ReactiveFormsModule, SicComboboxComponent, SicInputComponent, SicInputPhoneComponent, SicButtonComponent, SicInputAreaComponent, SicRadioComponent],
  templateUrl: './burt01.component.html',
  styleUrl: './burt01.component.css',
})
export class Burt01Component implements OnInit {

  readonly route = inject(ActivatedRoute);
  readonly dialog = inject(DialogService);
  readonly authService = inject(AuthService);
  readonly service = inject(Burt01Service);
  readonly router = inject(Router);

  formData!: SicFromData<Burt01Model>;

  ngOnInit(): void {
     const form:Burt01FormData = this.route.snapshot.data['form'];
     this.formData = form.businessInfo;
  }

  onCountryChange(event: any): void {
    this.formData.formGroup.get('supportLocalAddress')?.setValue(event.supportLocalAddress);
    this.formData.formGroup.get('provinceId')?.setValue(null);
    this.formData.formGroup.get('districtId')?.setValue(null);
    this.formData.formGroup.get('subDistrictId')?.setValue(null); 
    this.formData.formGroup.get('zipCode')?.setValue(null);
  }

  onProvinceChange(event: any): void {
    this.formData.formGroup.get('districtId')?.setValue(null);
    this.formData.formGroup.get('subDistrictId')?.setValue(null);
    this.formData.formGroup.get('zipCode')?.setValue(null);
  }

  onDistrictChange(event: any): void {
    this.formData.formGroup.get('subDistrictId')?.setValue(null);
    this.formData.formGroup.get('zipCode')?.setValue(null);
  }

  onSubDistrictChange(event: any): void {
    this.formData.formGroup.get('zipCode')?.setValue(event.zipCode);// You can add any logic here if needed when the sub-district changes 
  }

  submit() {
    this.formData.markAllAsTouched();
    if (this.formData.invalid) {
      this.dialog.warn('Invalid Form', 'Please correct the errors in the form before saving.');
    } else if (this.formData.isNotChanged) {
      this.dialog.warn('No Changes', 'There are no changes to save.');
    } else {
      this.save();
    }
  }

  save() {
    const data = this.formData.value;
    this.service.save(data).subscribe({
      next: (response) => {
        this.dialog.success('Business Saved', 'Your Business has been successfully saved.');
      },
      error: (error) => {
        this.dialog.error('Save Failed', error);
      }
    });
  }
}
