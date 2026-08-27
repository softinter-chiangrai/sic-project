import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToForm } from '../../../../../../core/types/form.type';
import { Pmdt04PreviewModel } from './pmdt04-preview.model';

export class Pmdt04PreviewForm {
  static createForm(fb: FormBuilder): FormGroup<ToForm<Pmdt04PreviewModel>> {
    return fb.group<ToForm<Pmdt04PreviewModel>>({
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
