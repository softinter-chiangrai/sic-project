import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToForm } from '../../core/types/form.type';
import { SignUpModel } from './sign-up.model';

export class SignUpForm {
  static createForm(fb: FormBuilder): FormGroup<ToForm<SignUpModel>> {
    return fb.group<ToForm<SignUpModel>>({
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
