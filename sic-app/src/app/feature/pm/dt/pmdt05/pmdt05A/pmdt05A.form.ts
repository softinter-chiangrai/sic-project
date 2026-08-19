// src/app/feature/pm/dt/pmdt06/pmdt06A/pmdt06A.form.ts
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Pmdt05AModel } from './pmdt05A.model';
import { ToForm } from '../../../../../core/types/form.type';

export class Pmdt05AForm {
  static createForm(fb: FormBuilder): FormGroup<ToForm<Pmdt05AModel>> {
    return fb.group<ToForm<Pmdt05AModel>>({
      id: fb.control(null),
      projectId: fb.control(null, [Validators.required]),
      diagramName: fb.control(null, [Validators.required]),
      diagramType: fb.control('ARCHITECTURE'),
      contentData: fb.control(null),
      state: fb.control(null),
      rowVersion: fb.control(null),
    });
  }
}
