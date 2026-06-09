import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToForm } from '../../../core/types/form.type';
import { JoinModel } from './business-join.model';

export class BusinessJoinForm {
  static createForm(fb: FormBuilder): FormGroup<ToForm<JoinModel>> {
    return fb.group<ToForm<JoinModel>>({
      token: fb.control(null, [Validators.required, Validators.maxLength(300)]),
    });
  }
}
