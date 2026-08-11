// src/app/feature/pm/dt/pmdt09/pmdt09A/pmdt09A.form.ts
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToForm } from '../../../../../core/types/form.type';
import { Pmdt09AModel } from './pmdt09A.model';

export class Pmdt09AForm {
  static createForm(fb: FormBuilder): FormGroup<ToForm<Pmdt09AModel>> {
    return fb.group<ToForm<Pmdt09AModel>>({
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
