// src/app/feature/bu/rt/burt02/burt02.form.ts
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToForm } from '../../../../core/types/form.type';
import { Burt02Model } from './burt02.model';

export class Burt02Form {
  static createForm(fb: FormBuilder): FormGroup<ToForm<Burt02Model>> {
    return fb.group<ToForm<Burt02Model>>({
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
