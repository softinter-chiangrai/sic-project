// src/app/feature/pm/dt/pmdt01/pmdt01A/pmdt01A.form.ts
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Pmdt01AModel } from './pmdt01A.model';
import { ToForm } from '../../../../../core/types/form.type';

export class Pmdt01AForm {
  static createForm(fb: FormBuilder): FormGroup<ToForm<Pmdt01AModel>> {
    return fb.group<ToForm<Pmdt01AModel>>({
      id: fb.control(null),
      projectId: fb.control(null, [Validators.required]),
      phaseName: fb.control(null, [Validators.required]),
      description: fb.control(null),
      startDate: fb.control(null, [Validators.required]),
      startTime: fb.control(null),
      endDate: fb.control(null, [Validators.required]),
      endTime: fb.control(null),
      owner: fb.control(null),
      color: fb.control(null),
      status: fb.control(null),
      progress: fb.control(null),
      state: fb.control(null),
      rowVersion: fb.control(null),
    });
  }
}
