// src/app/feature/pm/rt/pmrt03/pmrt03.form.ts
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToForm } from '../../../../core/types/form.type';
import { Pmrt03Model } from './pmrt03.model';

export class Pmrt03Form {
  static createForm(fb: FormBuilder): FormGroup<ToForm<Pmrt03Model>> {
    return fb.group<ToForm<Pmrt03Model>>({
      id: fb.control(null),
      projectId: fb.control(null, [Validators.required]),
      projectName: fb.control(null, [Validators.required]),
      progress: fb.control(0),
      phaseCount: fb.control(0),
      taskCount: fb.control(0),
      state: fb.control(null),
      rowVersion: fb.control(null),
    });
  }
}
