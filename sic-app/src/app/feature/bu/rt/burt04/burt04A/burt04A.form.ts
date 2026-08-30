import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ToForm } from "../../../../../core/types/form.type";
import { Burt04AModel } from "./burt04A.model";

export interface Burt04AFormModel extends Burt04AModel {
  userName?: string;
  userEmail?: string;
}

export class Burt04AForm {
  static createForm(fb: FormBuilder): FormGroup<ToForm<Burt04AFormModel>> {
    return fb.group<ToForm<Burt04AFormModel>>({
      id: fb.control(null),
      userId: fb.control(null, [Validators.required]),
      userName: fb.control({ value: '', disabled: true }),
      userEmail: fb.control({ value: '', disabled: true }),
      roleIds: fb.control([], [Validators.required]),
      isActive: fb.control(true),
      state: fb.control(null),
      rowVersion: fb.control(null),
    });
  }
}
