import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToForm } from '../../../../core/types/form.type';
import { Pmdt09Model } from './pmdt09.model';

export class Pmdt09Form {
  static createForm(fb: FormBuilder): FormGroup<ToForm<Pmdt09Model>> {
    return fb.group<ToForm<Pmdt09Model>>({
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
