import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToForm } from '../core/types/form.type';
import { FeatureModel } from './feature.model';

export class FeatureForm {
  static createForm(fb: FormBuilder): FormGroup<ToForm<FeatureModel>> {
    return fb.group<ToForm<FeatureModel>>({
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
