import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToForm } from '../../../../core/types/form.type';
import { Pmdt11Model } from './pmdt11.model';

export class Pmdt11Form {
  static createForm(fb: FormBuilder): FormGroup<ToForm<Pmdt11Model>> {
    return fb.group<ToForm<Pmdt11Model>>({
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
