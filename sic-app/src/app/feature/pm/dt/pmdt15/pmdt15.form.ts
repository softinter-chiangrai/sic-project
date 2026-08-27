import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToForm } from '../../../../core/types/form.type';
import { Pmdt15Model } from './pmdt15.model';

export class Pmdt15Form {
  static createForm(fb: FormBuilder): FormGroup<ToForm<Pmdt15Model>> {
    return fb.group<ToForm<Pmdt15Model>>({
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
