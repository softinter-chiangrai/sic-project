import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToForm } from '../../../../../core/types/form.type';
import { PmDeliveryModel } from './pmdt14A.model';

export class Pmdt14AForm {
  static createForm(fb: FormBuilder): FormGroup<ToForm<PmDeliveryModel>> {
    return fb.group<ToForm<PmDeliveryModel>>({
      id: fb.control(null),
      projectId: fb.control(null, [Validators.required]),
      contractId: fb.control(null),
      deliveryCode: fb.control(null, [Validators.required, Validators.maxLength(50)]),
      deliveryTitle: fb.control(null, [Validators.required, Validators.maxLength(200)]),
      deliveryType: fb.control('FINAL', [Validators.required]),
      deliveryVersion: fb.control('1.0', [Validators.required, Validators.maxLength(20)]),
      deliveryDate: fb.control(null, [Validators.required]),
      status: fb.control('DRAFT', [Validators.required]),
      releaseNote: fb.control(null),
      deliverySummary: fb.control(null),
      attachmentGroupId: fb.control(null),
      isActive: fb.control(true),
      state: fb.control(null),
      rowVersion: fb.control(null),
    });
  }
}
