// src/app/feature/pm/dt/pmdt08/pmdt08A/pmdt08A.form.ts
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToForm } from '../../../../../core/types/form.type';
import { Pmdt08AModel } from './pmdt08A.model';

export class Pmdt08AForm {
  static createForm(fb: FormBuilder): FormGroup<ToForm<Pmdt08AModel>> {
    return fb.group<ToForm<Pmdt08AModel>>({
      id: fb.control(null),
      projectId: fb.control(null, [Validators.required]),
      taskCode: fb.control(null, [Validators.required]),
      taskName: fb.control(null, [Validators.required]),
      description: fb.control(null),
      assignedTo: fb.control(null),
      startDate: fb.control(null, [Validators.required]),
      endDate: fb.control(null, [Validators.required]),
      estimateManday: fb.control(1, [Validators.required, Validators.min(1)]),
      priority: fb.control('Medium'),
      color: fb.control(null),
      state: fb.control(null),
      rowVersion: fb.control(null),
    });
  }
}
