// src/app/feature/pm/dt/pmdt08/pmdt08.form.ts
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToForm } from '../../../../core/types/form.type';
import { Pmdt08Model } from './pmdt08.model';

export class Pmdt08Form {
  static createForm(fb: FormBuilder): FormGroup<ToForm<Pmdt08Model>> {
    return fb.group<ToForm<Pmdt08Model>>({
      id: fb.control(null),
      projectId: fb.control(null, [Validators.required]),
      topic: fb.control(null, [Validators.required]),
      content: fb.control(null),
      category: fb.control('General'),
      author: fb.control(null),
      createdDate: fb.control(null),
      state: fb.control(null),
      rowVersion: fb.control(null),
    });
  }
}
