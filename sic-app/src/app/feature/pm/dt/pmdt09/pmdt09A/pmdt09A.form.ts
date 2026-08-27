import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToForm } from '../../../../../core/types/form.type';
import { Pmdt09AModel } from './pmdt09A.model';

export class Pmdt09AForm {
  static createForm(fb: FormBuilder): FormGroup<ToForm<Pmdt09AModel>> {
    return fb.group<ToForm<Pmdt09AModel>>({
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
