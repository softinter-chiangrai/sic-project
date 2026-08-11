// src/app/feature/bu/rt/burt03/burt03.form.ts
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToForm } from '../../../../core/types/form.type';
import { Burt03Model } from './burt03.model';

export class Burt03Form {
  static createForm(fb: FormBuilder): FormGroup<ToForm<Burt03Model>> {
    return fb.group<ToForm<Burt03Model>>({
      id: fb.control(null),
      roleCode: fb.control(null, [Validators.required]),
      roleName: fb.control(null, [Validators.required]),
      description: fb.control(null),
      permissions: fb.control([]),
      state: fb.control(null),
      rowVersion: fb.control(null),
    });
  }
}
