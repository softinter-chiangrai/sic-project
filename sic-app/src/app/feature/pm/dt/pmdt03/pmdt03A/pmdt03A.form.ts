// src/app/feature/pm/dt/pmdt03/pmdt03A/pmdt03A.form.ts
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToForm } from '../../../../../core/types/form.type';
import { Pmdt03AModel } from './pmdt03A.model';

export class Pmdt03AForm {
  static createForm(fb: FormBuilder): FormGroup<ToForm<Pmdt03AModel>> {
    return fb.group<ToForm<Pmdt03AModel>>({
      id: fb.control(null),
      documentType: fb.control(null, [Validators.required]),
      documentId: fb.control(null, [Validators.required]),
      documentCode: fb.control(null),
      documentTitle: fb.control(null, [Validators.required]),
      comment: fb.control(null),
      flowId: fb.control(null),
      state: fb.control(null),
      rowVersion: fb.control(null),
    });
  }
}
