// src/app/feature/pm/dt/pmdt07/pmdt07.form.ts
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToForm } from '../../../../core/types/form.type';
import { Pmdt07Model } from './pmdt07.model';

export class Pmdt07Form {
  static createForm(fb: FormBuilder): FormGroup<ToForm<Pmdt07Model>> {
    return fb.group<ToForm<Pmdt07Model>>({
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
