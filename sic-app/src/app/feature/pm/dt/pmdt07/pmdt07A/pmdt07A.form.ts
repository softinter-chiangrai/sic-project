// src/app/feature/pm/dt/pmdt07/pmdt07A/pmdt07A.form.ts
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToForm } from '../../../../../core/types/form.type';
import { Pmdt07AModel } from './pmdt07A.model';

export class Pmdt07AForm {
  static createForm(fb: FormBuilder): FormGroup<ToForm<Pmdt07AModel>> {
    return fb.group<ToForm<Pmdt07AModel>>({
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
