import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TaskModel } from './pmdt10.model';
import { ToForm } from '../../../../core/types/form.type';

export class Pmdt10Form {
  static createForm(fb: FormBuilder): FormGroup<ToForm<TaskModel>> {
    return fb.group<ToForm<TaskModel>>({
      id: fb.control(null),
      workPackageId: fb.control(null, [Validators.required]),
      specificationId: fb.control(null, [Validators.required]),
      taskCode: fb.control(null, [Validators.required]),
      taskName: fb.control(null, [Validators.required]),
      description: fb.control(null),
      assignedTo: fb.control(null),
      startDate: fb.control(null, [Validators.required]),
      startTime: fb.control('09:00', [Validators.required]),
      endDate: fb.control(null, [Validators.required]),
      endTime: fb.control('18:00', [Validators.required]),
      estimateManday: fb.control(null, [Validators.required, Validators.min(1)]),
      priority: fb.control('Medium'),
      status: fb.control('Todo'),
      color: fb.control('#3B82F6'),
      assigneeIds: fb.control([]),
      assigneeNames: fb.control(null),
      state: fb.control(null),
      rowVersion: fb.control(null),
    });
  }
}
