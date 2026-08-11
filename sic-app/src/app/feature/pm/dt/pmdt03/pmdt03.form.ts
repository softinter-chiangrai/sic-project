// src/app/feature/pm/dt/pmdt03/pmdt03.form.ts
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToForm } from '../../../../core/types/form.type';
import { Pmdt03Model } from './pmdt03.model';

export class Pmdt03Form {
  static createForm(fb: FormBuilder): FormGroup<ToForm<Pmdt03Model>> {
    return fb.group<ToForm<Pmdt03Model>>({
      id: fb.control(null),
      documentType: fb.control(null, [Validators.required]),
      documentId: fb.control(null, [Validators.required]),
      documentCode: fb.control(null),
      documentTitle: fb.control(null, [Validators.required]),
      requestedBy: fb.control(null),
      requestedDate: fb.control(null),
      status: fb.control('PENDING'),
      comment: fb.control(null),
      state: fb.control(null),
      rowVersion: fb.control(null),
    });
  }
}
