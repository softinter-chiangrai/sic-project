// src/app/feature/bu/rt/burt05/burt05.form.ts
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToForm } from '../../../../core/types/form.type';
import { Burt05Model } from './burt05.model';

export class Burt05Form {
  static createForm(fb: FormBuilder): FormGroup<ToForm<Burt05Model>> {
    return fb.group<ToForm<Burt05Model>>({
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
