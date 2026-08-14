// src/app/feature/bu/rt/burt04/burt04A/burt04A.form.ts
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Burt04AModel } from './burt04A.model';
import { ToForm } from '../../../../../core/types/form.type';

export class Burt04AForm {
  static createForm(fb: FormBuilder): FormGroup<ToForm<Burt04AModel>> {
    return fb.group<ToForm<Burt04AModel>>({
      id: fb.control(null),
      userId: fb.control(null, [Validators.required]),
      roleIds: fb.control([]),
      isActive: fb.control(true),
      state: fb.control(null),
      rowVersion: fb.control(null),
    });
  }
}
