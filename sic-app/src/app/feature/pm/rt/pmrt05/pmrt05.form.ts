import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToForm } from '../../../../core/types/form.type';
import { Pmrt05Model } from './pmrt05.model';

export class Pmrt05Form {
  static createForm(fb: FormBuilder): FormGroup<ToForm<Pmrt05Model>> {
    return fb.group<ToForm<Pmrt05Model>>({
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
