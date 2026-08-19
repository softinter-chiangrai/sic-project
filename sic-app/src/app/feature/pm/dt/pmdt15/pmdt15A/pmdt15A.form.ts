import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToForm } from '../../../../core/types/form.type';
import { PmUserManualModel } from './pmdt19.model';

export class Pmdt19Form {
  static createForm(fb: FormBuilder): FormGroup<ToForm<PmUserManualModel>> {
    return fb.group<ToForm<PmUserManualModel>>({
      id: fb.control(null),
      projectId: fb.control(null, [Validators.required]),
      manualCode: fb.control(null, [Validators.required, Validators.maxLength(50)]),
      manualTitle: fb.control(null, [Validators.required, Validators.maxLength(255)]),
      manualType: fb.control('USER'),
      version: fb.control('1.0'),
      relatedSpecId: fb.control(null),
      deliveryId: fb.control(null),
      status: fb.control('DRAFT'),
      attachmentGroupId: fb.control(null),
      sections: fb.control([]),
      state: fb.control(null),
      rowVersion: fb.control(null),
    });
  }
}
