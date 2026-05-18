import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ToForm } from "../../core/types/form.type";
import { EmailVerifyModel, ProfileModel } from "./profile.model";

export class ProfileForm {
  static createForm(fb: FormBuilder): FormGroup<ToForm<ProfileModel>> {
    return fb.group<ToForm<ProfileModel>>({
      id: fb.control(null),
      taxId: fb.control(null),
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
      uploadGroupId: fb.control(null),
      uploadGroupData: fb.control(null),
      phoneNumber: fb.control(null, [Validators.required, Validators.minLength(6)]),
      referenceNumber: fb.control(null),
      verifyToken: fb.control(null),
      state: fb.control(null),
      rowVersion: fb.control(null)
    });
  }

  static createVerifyForm(fb: FormBuilder): FormGroup<ToForm<EmailVerifyModel>> {
    return fb.group<ToForm<EmailVerifyModel>>({
      verifyType: fb.control(null),
      referenceNumber: fb.control(null, [Validators.required]),
      verifyToken: fb.control(null, [Validators.required]),
      expirationMinutes: fb.control(null),
      maxRetry: fb.control(null),
      recipient: fb.control(null)
    });
  }
}

