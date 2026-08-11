// src/app/feature/bu/rt/burt06/burt06A/burt06A.form.ts
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToForm } from '../../../../../core/types/form.type';
import { Burt06AModel } from './burt06A.model';

export class Burt06AForm {
  static createForm(fb: FormBuilder): FormGroup<ToForm<Burt06AModel>> {
    return fb.group<ToForm<Burt06AModel>>({
      id: fb.control(null),
      flowCode: fb.control(null, [Validators.required]),
      flowName: fb.control(null, [Validators.required]),
      documentType: fb.control(null, [Validators.required]),
      approvalMode: fb.control('CHAIN'),
      description: fb.control(null),
      active: fb.control(true),
      state: fb.control(null),
      rowVersion: fb.control(null),
    });
  }
}
