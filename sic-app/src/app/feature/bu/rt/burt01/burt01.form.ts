import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ToForm } from "../../../../core/types/form.type";
import { Burt01Model } from "./burt01.model";

export class Burt01Form {
  static createForm(fb: FormBuilder): FormGroup<ToForm<Burt01Model>> {
    return fb.group<ToForm<Burt01Model>>({
      id: fb.control(null),
      taxId: fb.control(null),
      businessCode: fb.control(null,[Validators.required, Validators.maxLength(20)]),
      branchCode: fb.control(null),
      personType: fb.control(null, [Validators.required]),
      titleId: fb.control(null, [Validators.required]),
      firstNameEn: fb.control(null, [Validators.required, Validators.maxLength(100)]),
      middleNameEn: fb.control(null, [Validators.maxLength(100)]),
      lastNameEn: fb.control(null, [Validators.maxLength(100)]),
      firstNameLocal: fb.control(null, [Validators.required, Validators.maxLength(100)]),
      middleNameLocal: fb.control(null, [Validators.maxLength(100)]),
      lastNameLocal: fb.control(null, [Validators.maxLength(100)]),
      countryId: fb.control(null, [Validators.required]),
      supportLocalAddress: fb.control(null),
      addressEn: fb.control(null),
      addressLocal: fb.control(null),
      provinceId: fb.control(null),
      districtId: fb.control(null),
      subDistrictId: fb.control(null),
      zipCode: fb.control(null),
      email: fb.control(null, [Validators.required, Validators.email, Validators.maxLength(320)]),
      phoneNumber: fb.control(null, [Validators.required, Validators.minLength(6)]),
      uploadGroupId: fb.control(null),
      uploadGroupData: fb.control(null),
      state: fb.control(null),
      rowVersion: fb.control(null)
    });
  }
}

