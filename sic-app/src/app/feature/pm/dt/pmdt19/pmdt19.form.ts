import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToForm } from '../../../../core/types/form.type';
import { Pmdt19Model } from './pmdt19.model';

export class Pmdt19Form {
  static createForm(fb: FormBuilder): FormGroup<ToForm<Pmdt19Model>> {
    return fb.group<ToForm<Pmdt19Model>>({
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
