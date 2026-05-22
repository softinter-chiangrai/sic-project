import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BusinessCreateModel } from './business-create.model';
import { ToForm } from '../../../core/types/form.type';

export class BusinessCreateForm {
  static createForm(fb: FormBuilder): FormGroup<ToForm<BusinessCreateModel>> {
    return fb.group<ToForm<BusinessCreateModel>>({
      id: fb.control(null, [Validators.maxLength(30)]),
      taxId: fb.control(null),
      branchCode: fb.control(null,Validators.maxLength(5)),
      businessCode: fb.control(null,Validators.maxLength(5)),
      personType: fb.control("INDIVIDUAL", [Validators.required]),
      titleId: fb.control(null, [Validators.required]),
      firstNameEn: fb.control(null, [Validators.required, Validators.maxLength(100)]),
      middleNameEn: fb.control(null, [Validators.maxLength(100)]),
      lastNameEn: fb.control(null, [Validators.maxLength(100)]),
      firstNameLocal: fb.control(null, [Validators.required, Validators.maxLength(100)]),
      middleNameLocal: fb.control(null, [Validators.maxLength(100)]),
      lastNameLocal: fb.control(null, [Validators.maxLength(100)]),
      countryId: fb.control(null, [Validators.required]),
      supportLocalAddress: fb.control(null),
      addressEn: fb.control(null, [Validators.maxLength(255)]),
      addressLocal: fb.control(null, [Validators.maxLength(255)]),
      provinceId: fb.control(null),
      districtId: fb.control(null),
      subDistrictId: fb.control(null),
      zipCode: fb.control(null, [Validators.maxLength(20)]),
      email: fb.control(null, [Validators.email, Validators.maxLength(320)]),
      uploadGroupId: fb.control(null),
      uploadGroupData: fb.control(null),
      phoneNumber: fb.control(null, [Validators.maxLength(20)]),
      fax: fb.control(null, [Validators.maxLength(20)]),
      isActive: fb.control(null),
      state: fb.control(null),
      rowVersion: fb.control(null),
    });
  }
}
