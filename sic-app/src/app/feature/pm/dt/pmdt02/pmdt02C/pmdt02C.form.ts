// src/app/feature/pm/dt/pmdt02/pmdt02C/pmdt02C.form.ts
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TaskModel } from './pmdt02C.model';
import { ToForm } from '../../../../../core/types/form.type';

export class Pmdt02CForm {
  static createForm(fb: FormBuilder): FormGroup<ToForm<TaskModel>> {
    return fb.group<ToForm<TaskModel>>({
      id: fb.control(null),
      workPackageId: fb.control(null),
      taskCode: fb.control(null, [Validators.required]),
      taskName: fb.control(null, [Validators.required]),
      description: fb.control(null),
      assignedTo: fb.control(null),
      startDate: fb.control(null, [Validators.required]),
      startTime: fb.control(null, [Validators.required]),
      endDate: fb.control(null, [Validators.required]),
      endTime: fb.control(null, [Validators.required]),
      estimateManday: fb.control(null, [Validators.required, Validators.min(1)]),
      priority: fb.control('Medium'),
      status: fb.control(null),
      color: fb.control(null),
      assigneeIds: fb.control([]),
      assigneeNames: fb.control(null),
      state: fb.control(null),
      rowVersion: fb.control(null),
    });
  }
}
