import { Component, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { SicFromData } from '../../../core/model/sic-from-data';
import { BusinessCreateModel, BusinessFormData } from './business-create.model';
import { SicProfileComponent } from "../../../core/component/sic-profile/sic-profile.component";
import { BusinessCreateService } from './business-create.service';
import { SicRadioComponent } from "../../../core/component/sic-radio/sic-radio.component";
import { SicComboboxComponent } from "../../../core/component/sic-combobox/sic-combobox.component";
import { SicButtonComponent } from "sic-ng";
import { SicInputComponent } from "../../../core/component/sic-input/sic-input.component";
import { SicInputAreaComponent } from 'sic-ng';
import { SicInputPhoneComponent } from 'sic-ng';
import { CanComponentDeactivate } from '../../../core/guard/can-deactivate.guard';
import { DialogService } from '../../../core/services/dialog.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

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
    SicInputPhoneComponent,
    TranslateModule
],
  templateUrl: './business-create.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './business-create.component.css'
})
export class BusinessCreateComponent implements OnInit, CanComponentDeactivate {

  readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);
  readonly service = inject(BusinessCreateService);
  readonly dialog = inject(DialogService);
  readonly translate = inject(TranslateService);
  
  formBusinessData!: SicFromData<BusinessCreateModel>;
  isSaving = signal(false);

  isSaved = false;
  pageDirty = () => this.isSaved ? false : (this.formBusinessData?.isChanged ?? false);

  ngOnInit(): void {
    const form: BusinessFormData = this.route.snapshot.data['form'];
    this.formBusinessData = form.business;
    const hasLocal = !!(
      this.formBusinessData?.formGroup?.get('supportLocalAddress')?.value ||
      this.formBusinessData?.formGroup?.get('provinceId')?.value ||
      this.formBusinessData?.value?.provinceId
    );
    if (hasLocal) {
      this.formBusinessData.formGroup.get('supportLocalAddress')?.setValue(true);
    }
  }
  

  onCountryChange(event: any): void {
    const supportLocal = !!event?.supportLocalAddress;
    this.formBusinessData.formGroup.get('supportLocalAddress')?.setValue(supportLocal);
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
    this.formBusinessData.formGroup.get('zipCode')?.setValue(event?.zipCode ?? null);
  }
  
  onBack(): void {
    this.router.navigate(['/management/business']);
  }


  submit(){
    this.formBusinessData.markAllAsTouched();
    if (this.formBusinessData.invalid) {
      this.dialog.warn(this.translate.instant('BUSINESS_CREATE_INVALID_FORM_TITLE'), this.translate.instant('BUSINESS_CREATE_INVALID_FORM_MSG'));
    } else {
      const data = this.formBusinessData.value;
      this.isSaving.set(true);
      this.service.save(data)
        .pipe(finalize(() => this.isSaving.set(false)))
        .subscribe({
          next: (response) => {
            this.isSaved = true;
            if (response) {
              localStorage.setItem('businessId', response);
            }
            this.dialog.success(this.translate.instant('BUSINESS_CREATE_SAVED_TITLE'), this.translate.instant('BUSINESS_CREATE_SAVED_MSG')).then((confirmed) => {
              this.formBusinessData.markAsPristine();
              this.router.navigate(['feature']);
            });
          },
          error: (error) => {
            this.dialog.error(this.translate.instant('BUSINESS_CREATE_SAVE_FAILED_TITLE'), error.error?.message || error.message || this.translate.instant('BUSINESS_CREATE_SAVE_FAILED_TITLE'));
          }
        });
    }
  }

}
