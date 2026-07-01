// src/app/feature/pm/rt/pmrt01A/pmrt01A.form.ts

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CustomerModel } from './pmrt01A.model';
import type { ToForm } from '../../../../../core/types/form.type';


export class Pmrt01AForm {
  static createForm(fb: FormBuilder): FormGroup<ToForm<CustomerModel>> {
    return fb.group<ToForm<CustomerModel>>({
      id: fb.control(null),
      customerCode: fb.control(null, [Validators.required, Validators.maxLength(30)]),
      taxId: fb.control(null, [Validators.maxLength(30)]),
      companyNameEn: fb.control(null, [Validators.required, Validators.maxLength(255)]),
      companyNameLocal: fb.control(null, [Validators.required, Validators.maxLength(255)]),
      contactPerson: fb.control(null, [Validators.maxLength(255)]),
      phoneNumber: fb.control(null, [Validators.maxLength(20)]),
      email: fb.control(null, [Validators.email, Validators.maxLength(320)]),
      lineId: fb.control(null, [Validators.maxLength(100)]),
      addressEn: fb.control(null, [Validators.maxLength(500)]),
      addressLocal: fb.control(null, [Validators.maxLength(500)]),
      provinceId: fb.control(null),
      districtId: fb.control(null),
      subDistrictId: fb.control(null),
      countryId: fb.control(null),
      zipCode: fb.control(null, [Validators.maxLength(20)]),
      customerType: fb.control(null, [Validators.maxLength(50)]),
      remark: fb.control(null, [Validators.maxLength(500)]),
      isActive: fb.control(true),
      uploadGroupId: fb.control(null),
      uploadGroupData: fb.control(null),
      state: fb.control(null),
      rowVersion: fb.control(null),
    });
  }
}