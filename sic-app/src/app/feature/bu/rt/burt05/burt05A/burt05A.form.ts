// src/app/feature/bu/rt/burt05/burt05A/burt05A.form.ts
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Burt05AModel } from './burt05A.model';
import { ToForm } from '../../../../../core/types/form.type';

export class Burt05AForm {
  static createForm(fb: FormBuilder): FormGroup<ToForm<Burt05AModel>> {
    return fb.group<ToForm<Burt05AModel>>({
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
