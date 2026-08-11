// src/app/feature/pm/rt/pmrt04/pmrt04A/pmrt04A.form.ts
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToForm } from '../../../../../core/types/form.type';
import { Pmrt04AModel } from './pmrt04A.model';

export class Pmrt04AForm {
  static createForm(fb: FormBuilder): FormGroup<ToForm<Pmrt04AModel>> {
    return fb.group<ToForm<Pmrt04AModel>>({
      id: fb.control(null),
      contractId: fb.control(null, [Validators.required]),
      installmentNo: fb.control(1, [Validators.required]),
      installmentName: fb.control(null, [Validators.required]),
      amount: fb.control(null),
      dueDate: fb.control(null),
      status: fb.control('PENDING'),
      state: fb.control(null),
      rowVersion: fb.control(null),
    });
  }
}
