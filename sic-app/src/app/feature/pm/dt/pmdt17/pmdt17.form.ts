import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToForm } from '../../../../core/types/form.type';
import { Pmdt17Model } from './pmdt17.model';

export class Pmdt17Form {
  static createForm(fb: FormBuilder): FormGroup<ToForm<Pmdt17Model>> {
    return fb.group<ToForm<Pmdt17Model>>({
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
