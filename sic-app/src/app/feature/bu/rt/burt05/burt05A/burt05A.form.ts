// src/app/feature/bu/rt/burt05/burt05A/burt05A.form.ts
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Burt05AModel } from './burt05A.model';
import { ToForm } from '../../../../../core/types/form.type';

export class Burt05AForm {
  static createForm(fb: FormBuilder): FormGroup<ToForm<Burt05AModel>> {
    return fb.group<ToForm<Burt05AModel>>({
      id: fb.control(null),
      programCode: fb.control('', [Validators.required, Validators.maxLength(50)]),
      programNameEn: fb.control('', [Validators.required, Validators.maxLength(255)]),
      programNameLocal: fb.control('', [Validators.required, Validators.maxLength(255)]),
      programIcon: fb.control(''),
      routePath: fb.control('', [Validators.maxLength(500)]),
      parentProgramId: fb.control(null),
      sortOrder: fb.control(0),
      isActive: fb.control(true),
      state: fb.control(null),
      rowVersion: fb.control(null),
    });
  }
}
