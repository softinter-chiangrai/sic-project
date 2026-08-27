import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToForm } from '../../core/types/form.type';
import { DashboardModel } from './dashboard.model';

export class DashboardForm {
  static createForm(fb: FormBuilder): FormGroup<ToForm<DashboardModel>> {
    return fb.group<ToForm<DashboardModel>>({
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
