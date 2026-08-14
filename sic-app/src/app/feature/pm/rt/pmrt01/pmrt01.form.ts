// src/app/feature/pm/rt/pmrt01/pmrt01.form.ts
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Pmrt01Model } from './pmrt01.model';
import { ToForm } from '../../../../core/types/form.type';

export class Pmrt01Form {
  static createForm(fb: FormBuilder): FormGroup<ToForm<Pmrt01Model>> {
    return fb.group<ToForm<Pmrt01Model>>({
      id: fb.control(null),
      customerCode: fb.control(null, [Validators.required]),
      customerName: fb.control(null, [Validators.required]),
      email: fb.control(null, [Validators.email]),
      phone: fb.control(null),
      status: fb.control('ACTIVE'),
      state: fb.control(null),
      rowVersion: fb.control(null),
    });
  }
}
