// src/app/feature/bu/rt/burt02/burt02A/burt02A.form.ts
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToForm } from '../../../../../core/types/form.type';
import { Burt02AModel } from './burt02A.model';


export class Burt02AForm {
  static createForm(fb: FormBuilder): FormGroup<ToForm<Burt02AModel>> {
    return fb.group<ToForm<Burt02AModel>>({
      id: fb.control(null),
      customerCode: fb.control(null, [Validators.required]),
      customerName: fb.control(null, [Validators.required]),
      email: fb.control(null, [Validators.email]),
      phone: fb.control(null),
      address: fb.control(null),
      taxId: fb.control(null),
      state: fb.control(null),
      rowVersion: fb.control(null),
    });
  }
}
