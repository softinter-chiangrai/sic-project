import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToForm } from '../../../../core/types/form.type';
import { SqlExportDialogModel } from './sql-export-dialog.model';

export class SqlExportDialogForm {
  static createForm(fb: FormBuilder): FormGroup<ToForm<SqlExportDialogModel>> {
    return fb.group<ToForm<SqlExportDialogModel>>({
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
