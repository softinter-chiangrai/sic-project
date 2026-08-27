import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToForm } from '../../../../../core/types/form.type';
import { Pmdt10CModel } from './pmdt10C.model';

export class Pmdt10CForm {
  static createForm(fb: FormBuilder): FormGroup<ToForm<Pmdt10CModel>> {
    return fb.group<ToForm<Pmdt10CModel>>({
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
