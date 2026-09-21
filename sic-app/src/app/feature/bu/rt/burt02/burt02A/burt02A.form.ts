// src/app/feature/bu/rt/burt02/burt02A/burt02A.form.ts
import { FormBuilder, FormGroup } from '@angular/forms';
import { ToForm } from '../../../../../core/types/form.type';
import { Burt02AModel } from './burt02A.model';

export class Burt02AForm {
  static createForm(fb: FormBuilder): FormGroup<ToForm<Burt02AModel>> {
    return fb.group<ToForm<Burt02AModel>>({
      roleId: fb.control(''),
      roleCode: fb.control(''),
      roleName: fb.control(''),
      modules: fb.control([]),
      state: fb.control(null),
      rowVersion: fb.control(null),
    });
  }
}
