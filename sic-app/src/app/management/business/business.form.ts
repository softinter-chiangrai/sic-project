import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToForm } from '../../core/types/form.type';
import { BusinessModel } from './business.model';

export class BusinessForm {
  static createForm(fb: FormBuilder): FormGroup<ToForm<BusinessModel>> {
    return fb.group<ToForm<BusinessModel>>({
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
