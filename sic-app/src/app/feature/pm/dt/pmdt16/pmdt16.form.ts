import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToForm } from '../../../../core/types/form.type';
import { Pmdt16Model } from './pmdt16.model';

export class Pmdt16Form {
  static createForm(fb: FormBuilder): FormGroup<ToForm<Pmdt16Model>> {
    return fb.group<ToForm<Pmdt16Model>>({
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
