import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToForm } from '../../../core/types/form.type';
import { ContactModel } from './contact.model';

export class ContactForm {
  static createForm(fb: FormBuilder): FormGroup<ToForm<ContactModel>> {
    return fb.group<ToForm<ContactModel>>({
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
