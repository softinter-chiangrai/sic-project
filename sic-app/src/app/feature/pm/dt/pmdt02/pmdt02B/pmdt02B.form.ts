// src/app/feature/pm/dt/pmdt02/pmdt02B/pmdt02B.form.ts
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { WorkPackageModel } from './pmdt02B.model';
import { ToForm } from '../../../../../core/types/form.type';

export class Pmdt02BForm {
  static createForm(fb: FormBuilder): FormGroup<ToForm<WorkPackageModel>> {
    return fb.group<ToForm<WorkPackageModel>>({
      id: fb.control(null),
      milestoneId: fb.control(null),
      packageName: fb.control(null, [Validators.required]),
      description: fb.control(null),
      startDate: fb.control(null, [Validators.required]),
      startTime: fb.control(null, [Validators.required]),
      endDate: fb.control(null, [Validators.required]),
      endTime: fb.control(null, [Validators.required]),
      status: fb.control(null),
      color: fb.control(null),
      state: fb.control(null),
      rowVersion: fb.control(null),
    });
  }
}
