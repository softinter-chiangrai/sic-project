// src/app/feature/pm/dt/pmdt01/pmdt01.form.ts
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToForm } from '../../../../core/types/form.type';
import { PhaseModel } from './pmdt01.model';

export class Pmdt01Form {
  static createForm(fb: FormBuilder): FormGroup<ToForm<PhaseModel>> {
    return fb.group<ToForm<PhaseModel>>({
      id: fb.control(null),
      projectId: fb.control(null, [Validators.required]),
      phaseName: fb.control(null, [Validators.required]),
      description: fb.control(null),
      startDate: fb.control(null, [Validators.required]),
      endDate: fb.control(null, [Validators.required]),
      owner: fb.control(null),
      color: fb.control(null),
      state: fb.control(null),
      rowVersion: fb.control(null),
    });
  }
}