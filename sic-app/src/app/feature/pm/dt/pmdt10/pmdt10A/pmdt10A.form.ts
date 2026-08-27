import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToForm } from '../../../../../core/types/form.type';
import { Pmdt10AModel } from './pmdt10A.model';

export class Pmdt10AForm {
  static createForm(fb: FormBuilder): FormGroup<ToForm<Pmdt10AModel>> {
    return fb.group<ToForm<Pmdt10AModel>>({
      id: fb.control(null),
      code: fb.control(null),
      name: fb.control(null, [Validators.required]),
      description: fb.control(null),
      isActive: fb.control(true),
      state: fb.control(null),
      rowVersion: fb.control(null),
    });
  }
}
