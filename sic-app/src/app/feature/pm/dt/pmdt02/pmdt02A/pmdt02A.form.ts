// src/app/feature/pm/dt/pmdt02/pmdt02A/pmdt02A.form.ts
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToForm } from '../../../../../core/types/form.type';
import { MilestoneModel } from './pmdt02A.model';

export class Pmdt02AForm {
  static createForm(fb: FormBuilder): FormGroup<ToForm<MilestoneModel>> {
    return fb.group<ToForm<MilestoneModel>>({
      id: fb.control(null),
      phaseId: fb.control(null),
      milestoneName: fb.control(null, [Validators.required]),
      description: fb.control(null),
      dueDate: fb.control(null, [Validators.required]),
      dueTime: fb.control(null, [Validators.required]),
      status: fb.control(null),
      color: fb.control(null),
      state: fb.control(null),
      rowVersion: fb.control(null),
    });
  }
}
