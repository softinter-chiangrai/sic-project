import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CustomerModel } from './pmdt01.model';
import type { ToForm } from '../../../../core/types/form.type';


export class Pmdt01Form {
  static createForm(fb: FormBuilder): FormGroup<ToForm<CustomerModel>> {
    return fb.group<ToForm<CustomerModel>>({
      id: fb.control(null),
      personType: fb.control('INDIVIDUAL', [Validators.required]),
      businessCode: fb.control(null, [Validators.required, Validators.maxLength(30)]),
      taxId: fb.control(null, [Validators.maxLength(30)]),
      branchCode: fb.control({ value: null, disabled: true }, [Validators.maxLength(30)]),
      titleId: fb.control(null),
      firstNameEn: fb.control(null, [Validators.required, Validators.maxLength(100)]),
      middleNameEn: fb.control(null, [Validators.maxLength(100)]),
      lastNameEn: fb.control(null, [Validators.maxLength(100)]),
      firstNameLocal: fb.control(null, [Validators.required, Validators.maxLength(100)]),
      middleNameLocal: fb.control(null, [Validators.maxLength(100)]),
      lastNameLocal: fb.control(null, [Validators.maxLength(100)]),
      countryId: fb.control(null),
      supportLocalAddress: fb.control(false),
      addressEn: fb.control(null, [Validators.maxLength(255)]),
      addressLocal: fb.control(null, [Validators.maxLength(255)]),
      provinceId: fb.control(null),
      districtId: fb.control(null),
      subDistrictId: fb.control(null),
      zipCode: fb.control(null, [Validators.maxLength(20)]),
      email: fb.control(null, [Validators.email, Validators.maxLength(320)]),
      phoneNumber: fb.control(null, [Validators.maxLength(20)]),
      uploadGroupId: fb.control(null),
      uploadGroupData: fb.control(null),
      isActive: fb.control(null),
      state: fb.control(null),
      rowVersion: fb.control(null),
    });
  }
}