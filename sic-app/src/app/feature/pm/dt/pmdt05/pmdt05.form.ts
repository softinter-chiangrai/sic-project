// src/app/feature/pm/dt/pmdt05/pmdt05.form.ts
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Pmdt05Model } from './pmdt05.model';
import { ToForm } from '../../../../core/types/form.type';

export class Pmdt05Form {
  static createForm(fb: FormBuilder): FormGroup<ToForm<Pmdt05Model>> {
    return fb.group<ToForm<Pmdt05Model>>({
      id: fb.control(null),
      projectId: fb.control(null, [Validators.required]),
      exportFormat: fb.control('PDF'),
      includeDiagrams: fb.control(true),
      state: fb.control(null),
      rowVersion: fb.control(null),
    });
  }
}
