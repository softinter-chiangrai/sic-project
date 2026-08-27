import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToForm } from '../../../core/types/form.type';
import { BlogModel } from './blog.model';

export class BlogForm {
  static createForm(fb: FormBuilder): FormGroup<ToForm<BlogModel>> {
    return fb.group<ToForm<BlogModel>>({
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
