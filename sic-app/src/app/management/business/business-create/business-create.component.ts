import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SicFromData } from '../../../core/model/sic-from-data';
import { BusinessCreateModel, BusinessFormData } from './business-create.model';
import { SicProfileComponent } from "../../../core/component/sic-profile/sic-profile.component";
import { BusinessCreateService } from './business-create.service';
import { SicRadioComponent } from "../../../core/component/sic-radio/sic-radio.component";
import { SicComboboxComponent } from "../../../core/component/sic-combobox/sic-combobox.component";
import { SicButtonComponent } from "../../../core/component/sic-button/sic-button.component";
import { SicInputComponent } from "../../../core/component/sic-input/sic-input.component";
import { SicInputAreaComponent } from "../../../core/component/sic-input-area/sic-input-area.component";
import { SicInputPhoneComponent } from "../../../core/component/sic-input-phone/sic-input-phone.component";
import { CanComponentDeactivate } from '../../../core/guard/can-deactivate.guard';
import { DialogService } from '../../../core/services/dialog.service';

@Component({
  selector: 'app-business-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SicProfileComponent,
    SicRadioComponent,
    SicComboboxComponent,
    SicButtonComponent,
    SicInputComponent,
    SicInputAreaComponent,
    SicInputPhoneComponent
],
  templateUrl: './business-create.component.html',
  styleUrl: './business-create.component.css'
})
export class BusinessCreateComponent implements OnInit, CanComponentDeactivate {

  readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);
  readonly service = inject(BusinessCreateService);
  readonly dialog = inject(DialogService);
  
  formBusinessData!: SicFromData<BusinessCreateModel>;

  pageDirty = () => this.formBusinessData.dirty;

  ngOnInit(): void {
    const form:BusinessFormData = this.route.snapshot.data['form'];
    this.formBusinessData = form.business;
  }
  

  onCountryChange(event: any): void {
    this.formBusinessData.formGroup.get('supportLocalAddress')?.setValue(event.supportLocalAddress);
    this.formBusinessData.formGroup.get('provinceId')?.setValue(null);
    this.formBusinessData.formGroup.get('districtId')?.setValue(null);
    this.formBusinessData.formGroup.get('subDistrictId')?.setValue(null); 
    this.formBusinessData.formGroup.get('zipCode')?.setValue(null);
  }

  onProvinceChange(event: any): void {
    this.formBusinessData.formGroup.get('districtId')?.setValue(null);
    this.formBusinessData.formGroup.get('subDistrictId')?.setValue(null);
    this.formBusinessData.formGroup.get('zipCode')?.setValue(null);
  }

  onDistrictChange(event: any): void {
    this.formBusinessData.formGroup.get('subDistrictId')?.setValue(null);
    this.formBusinessData.formGroup.get('zipCode')?.setValue(null);
  }

  onSubDistrictChange(event: any): void {
    this.formBusinessData.formGroup.get('zipCode')?.setValue(event.zipCode);// You can add any logic here if needed when the sub-district changes 
  }
  
  onBack(): void {
    this.router.navigate(['/management/business']);
  }


  submit(){
    this.formBusinessData.markAllAsTouched();
    if (this.formBusinessData.invalid) {
      this.dialog.warn('Invalid Form', 'Please correct the errors in the form before saving.');
    } else {
      const data = this.formBusinessData.value;
      this.service.save(data).subscribe({
      next: (response) => {
        this.dialog.success('Profile Saved', 'Your profile has been successfully saved.').then((confirmed) => {
          this.formBusinessData.markAsPristine();
          this.router.navigate(['feature']);
        });
      },
      error: (error) => {
        this.dialog.error('Save Failed', error);
      }
    });
    }
  }

}
