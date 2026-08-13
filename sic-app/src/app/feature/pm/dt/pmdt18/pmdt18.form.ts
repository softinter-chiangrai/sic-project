import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToForm } from '../../../../core/types/form.type';
import { PmDeliveryModel } from './pmdt18.model';

export class Pmdt18Form {
  static createForm(fb: FormBuilder): FormGroup<ToForm<PmDeliveryModel>> {
    return fb.group<ToForm<PmDeliveryModel>>({
      id: fb.control(null),
      projectId: fb.control(null, [Validators.required]),
      deliveryCode: fb.control(null, [Validators.required, Validators.maxLength(50)]),
      deliveryTitle: fb.control(null, [Validators.required, Validators.maxLength(255)]),
      deliveryType: fb.control('FINAL'),
      contractId: fb.control(null),
      milestoneId: fb.control(null),
      deliveryDate: fb.control(null),
      deliveryVersion: fb.control('1.0'),
      releaseNote: fb.control(null),
      deliverySummary: fb.control(null),
      status: fb.control('DRAFT'),
      pmApprovedBy: fb.control(null),
      pmApprovedDate: fb.control(null),
      customerSignedBy: fb.control(null),
      customerSignedDate: fb.control(null),
      attachmentGroupId: fb.control(null),
      checklists: fb.control([]),
      state: fb.control(null),
      rowVersion: fb.control(null),
    });
  }
}
