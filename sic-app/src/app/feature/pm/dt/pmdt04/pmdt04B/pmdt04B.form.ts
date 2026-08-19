// src/app/feature/pm/dt/pmdt04/pmdt04B/pmdt04B.form.ts
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Pmdt04BModel } from './pmdt04B.model';
import { ToForm } from '../../../../../core/types/form.type';

export class Pmdt04BForm {
  static createForm(fb: FormBuilder): FormGroup<ToForm<Pmdt04BModel>> {
    return fb.group<ToForm<Pmdt04BModel>>({
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
