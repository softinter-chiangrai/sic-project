// src/app/feature/pm/dt/pmdt06/pmdt06.form.ts
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToForm } from '../../../../core/types/form.type';
import { Pmdt06Model } from './pmdt06.model';

export class Pmdt06Form {
  static createForm(fb: FormBuilder): FormGroup<ToForm<Pmdt06Model>> {
    return fb.group<ToForm<Pmdt06Model>>({
      id: fb.control(null),
      projectId: fb.control(null, [Validators.required]),
      diagramName: fb.control(null, [Validators.required]),
      diagramType: fb.control('ARCHITECTURE'),
      contentData: fb.control(null),
      version: fb.control('1.0'),
      state: fb.control(null),
      rowVersion: fb.control(null),
    });
  }
}
