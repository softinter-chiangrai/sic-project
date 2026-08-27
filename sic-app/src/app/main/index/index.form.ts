import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToForm } from '../../core/types/form.type';
import { IndexModel } from './index.model';

export class IndexForm {
  static createForm(fb: FormBuilder): FormGroup<ToForm<IndexModel>> {
    return fb.group<ToForm<IndexModel>>({
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
