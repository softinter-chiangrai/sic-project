import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToForm } from '../../../../core/types/form.type';
import { Pmdt18Model } from './pmdt18.model';

export class Pmdt18Form {
  static createForm(fb: FormBuilder): FormGroup<ToForm<Pmdt18Model>> {
    return fb.group<ToForm<Pmdt18Model>>({
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
