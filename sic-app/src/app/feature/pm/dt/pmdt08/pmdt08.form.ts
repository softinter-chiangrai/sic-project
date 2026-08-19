// src/app/feature/pm/dt/pmdt09/pmdt09.form.ts
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToForm } from '../../../../core/types/form.type';
import { Pmdt09Model } from './pmdt09.model';

export class Pmdt09Form {
  static createForm(fb: FormBuilder): FormGroup<ToForm<Pmdt09Model>> {
    return fb.group<ToForm<Pmdt09Model>>({
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
