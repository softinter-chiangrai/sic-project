import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToForm } from '../core/types/form.type';
import { ManagementModel } from './management.model';

export class ManagementForm {
  static createForm(fb: FormBuilder): FormGroup<ToForm<ManagementModel>> {
    return fb.group<ToForm<ManagementModel>>({
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
