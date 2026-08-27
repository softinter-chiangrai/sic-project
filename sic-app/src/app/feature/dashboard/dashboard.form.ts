import { FormBuilder, FormGroup } from '@angular/forms';
import { ToForm } from '../../core/types/form.type';
import { DashboardModel } from './dashboard.model';

export class DashboardForm {
  static createForm(fb: FormBuilder): FormGroup<ToForm<DashboardModel>> {
    return fb.group<ToForm<DashboardModel>>({
      id: fb.control(null),
      searchQuery: fb.control(null),
      selectedCategory: fb.control(null),
      isAdmin: fb.control(false),
      state: fb.control(null),
      rowVersion: fb.control(null),
    });
  }
}
