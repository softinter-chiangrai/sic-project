// src/app/feature/pm/dt/pmdt04/pmdt04A/pmdt04A.form.ts
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToForm } from '../../../../../core/types/form.type';
import { Pmdt04AModel } from './pmdt04A.model';

export class Pmdt04AForm {
  static createForm(fb: FormBuilder): FormGroup<ToForm<Pmdt04AModel>> {
    return fb.group<ToForm<Pmdt04AModel>>({
      id: fb.control(null),
      projectId: fb.control(null, [Validators.required]),
      reqCode: fb.control(null, [Validators.required]),
      title: fb.control(null, [Validators.required]),
      description: fb.control(null),
      reqType: fb.control(null),
      priority: fb.control('Medium'),
      status: fb.control('DRAFT'),
      assignedTo: fb.control(null),
      state: fb.control(null),
      rowVersion: fb.control(null),
    });
  }
}
