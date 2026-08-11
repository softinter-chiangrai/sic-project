// src/app/feature/bu/rt/burt06/burt06.form.ts
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToForm } from '../../../../core/types/form.type';
import { Burt06Model } from './burt06.model';

export class Burt06Form {
  static createForm(fb: FormBuilder): FormGroup<ToForm<Burt06Model>> {
    return fb.group<ToForm<Burt06Model>>({
      id: fb.control(null),
      userId: fb.control(null, [Validators.required]),
      userName: fb.control(null),
      userEmail: fb.control(null),
      roleIds: fb.control([]),
      isActive: fb.control(true),
      state: fb.control(null),
      rowVersion: fb.control(null),
    });
  }
}
