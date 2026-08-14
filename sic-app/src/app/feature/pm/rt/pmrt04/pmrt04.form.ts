// src/app/feature/pm/rt/pmrt04/pmrt04.form.ts
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Pmrt04Model } from './pmrt04.model';
import { ToForm } from '../../../../core/types/form.type';

export class Pmrt04Form {
  static createForm(fb: FormBuilder): FormGroup<ToForm<Pmrt04Model>> {
    return fb.group<ToForm<Pmrt04Model>>({
      id: fb.control(null),
      projectId: fb.control(null, [Validators.required]),
      contractCode: fb.control(null, [Validators.required]),
      contractName: fb.control(null, [Validators.required]),
      amount: fb.control(null),
      startDate: fb.control(null),
      endDate: fb.control(null),
      status: fb.control('ACTIVE'),
      state: fb.control(null),
      rowVersion: fb.control(null),
    });
  }
}
