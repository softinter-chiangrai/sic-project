import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToForm } from '../../../../../core/types/form.type';
import { Pmdt13AModel } from './pmdt13A.model';

export class Pmdt13AForm {
  static createForm(fb: FormBuilder): FormGroup<ToForm<Pmdt13AModel>> {
    return fb.group<ToForm<Pmdt13AModel>>({
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
