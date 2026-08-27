import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToForm } from '../core/types/form.type';
import { TutorialModel } from './tutorial.model';

export class TutorialForm {
  static createForm(fb: FormBuilder): FormGroup<ToForm<TutorialModel>> {
    return fb.group<ToForm<TutorialModel>>({
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
