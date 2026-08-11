// src/app/feature/pm/rt/pmrt02/pmrt02.form.ts
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToForm } from '../../../../core/types/form.type';
import { Pmrt02Model } from './pmrt02.model';

export class Pmrt02Form {
  static createForm(fb: FormBuilder): FormGroup<ToForm<Pmrt02Model>> {
    return fb.group<ToForm<Pmrt02Model>>({
      id: fb.control(null),
      projectCode: fb.control(null, [Validators.required]),
      projectName: fb.control(null, [Validators.required]),
      description: fb.control(null),
      startDate: fb.control(null),
      endDate: fb.control(null),
      status: fb.control('ACTIVE'),
      state: fb.control(null),
      rowVersion: fb.control(null),
    });
  }
}
