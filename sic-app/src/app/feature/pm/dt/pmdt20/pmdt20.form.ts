import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToForm } from '../../../../core/types/form.type';
import { Pmdt20Model } from './pmdt20.model';

export class Pmdt20Form {
  static createForm(fb: FormBuilder): FormGroup<ToForm<Pmdt20Model>> {
    return fb.group<ToForm<Pmdt20Model>>({
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
