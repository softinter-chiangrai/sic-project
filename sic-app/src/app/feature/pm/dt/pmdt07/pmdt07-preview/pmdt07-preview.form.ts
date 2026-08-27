import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToForm } from '../../../../../core/types/form.type';
import { Pmdt07PreviewModel } from './pmdt07-preview.model';

export class Pmdt07PreviewForm {
  static createForm(fb: FormBuilder): FormGroup<ToForm<Pmdt07PreviewModel>> {
    return fb.group<ToForm<Pmdt07PreviewModel>>({
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
