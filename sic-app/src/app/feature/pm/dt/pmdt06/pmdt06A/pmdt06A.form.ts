// src/app/feature/pm/dt/pmdt07/pmdt07A/pmdt07A.form.ts
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Pmdt06AModel } from './pmdt06A.model';
import { ToForm } from '../../../../../core/types/form.type';

export class Pmdt06AForm {
  static createForm(fb: FormBuilder): FormGroup<ToForm<Pmdt06AModel>> {
    return fb.group<ToForm<Pmdt06AModel>>({
      id: fb.control(null),
      projectId: fb.control(null, [Validators.required]),
      crCode: fb.control(null, [Validators.required]),
      title: fb.control(null, [Validators.required]),
      description: fb.control(null),
      impactScore: fb.control(null),
      costImpact: fb.control(null),
      scheduleImpactDays: fb.control(null),
      status: fb.control('DRAFT'),
      state: fb.control(null),
      rowVersion: fb.control(null),
    });
  }
}
