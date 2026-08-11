// src/app/feature/pm/dt/pmdt04/pmdt04.form.ts
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToForm } from '../../../../core/types/form.type';
import { Pmdt04Model } from './pmdt04.model';

export class Pmdt04Form {
  static createForm(fb: FormBuilder): FormGroup<ToForm<Pmdt04Model>> {
    return fb.group<ToForm<Pmdt04Model>>({
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
