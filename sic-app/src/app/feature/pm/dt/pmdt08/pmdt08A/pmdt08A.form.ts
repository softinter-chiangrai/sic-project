// src/app/feature/pm/dt/pmdt08/pmdt08A/pmdt08A.form.ts
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Pmdt08AModel } from './pmdt08A.model';
import { ToForm } from '../../../../../core/types/form.type';

export class Pmdt08AForm {
  static createForm(fb: FormBuilder): FormGroup<ToForm<Pmdt08AModel>> {
    return fb.group<ToForm<Pmdt08AModel>>({
      id: fb.control(null),
      projectId: fb.control(null, [Validators.required]),
      topic: fb.control(null, [Validators.required]),
      content: fb.control(null),
      category: fb.control('General'),
      author: fb.control(null),
      state: fb.control(null),
      rowVersion: fb.control(null),
    });
  }
}
