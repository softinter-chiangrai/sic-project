// src/app/feature/pm/rt/pmrt04/pmrt04B/pmrt04B.form.ts
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToForm } from '../../../../../core/types/form.type';
import { Pmrt04BModel } from './pmrt04B.model';

export class Pmrt04BForm {
  static createForm(fb: FormBuilder): FormGroup<ToForm<Pmrt04BModel>> {
    return fb.group<ToForm<Pmrt04BModel>>({
      id: fb.control(null),
      contractId: fb.control(null, [Validators.required]),
      deliverableCode: fb.control(null, [Validators.required]),
      deliverableName: fb.control(null, [Validators.required]),
      description: fb.control(null),
      dueDate: fb.control(null),
      status: fb.control('PENDING'),
      state: fb.control(null),
      rowVersion: fb.control(null),
    });
  }
}
