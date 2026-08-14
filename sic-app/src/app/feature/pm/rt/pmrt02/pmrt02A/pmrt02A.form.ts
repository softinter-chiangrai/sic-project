// src/app/feature/pm/rt/pmrt02/pmrt02A/pmrt02A.form.ts
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Pmrt02AModel } from './pmrt02A.model';
import { ToForm } from '../../../../../core/types/form.type';

export class Pmrt02AForm {
  static createForm(fb: FormBuilder): FormGroup<ToForm<Pmrt02AModel>> {
    return fb.group<ToForm<Pmrt02AModel>>({
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
