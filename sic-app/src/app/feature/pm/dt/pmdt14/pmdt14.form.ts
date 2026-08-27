import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToForm } from '../../../../core/types/form.type';
import { Pmdt14Model } from './pmdt14.model';

export class Pmdt14Form {
  static createForm(fb: FormBuilder): FormGroup<ToForm<Pmdt14Model>> {
    return fb.group<ToForm<Pmdt14Model>>({
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
