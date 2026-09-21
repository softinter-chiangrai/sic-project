import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToForm } from '../../../../../core/types/form.type';
import { PmUserManualModel } from './pmdt15A.model';

export class Pmdt15AForm {
  static createForm(fb: FormBuilder, data?: Partial<PmUserManualModel> | null): FormGroup<ToForm<PmUserManualModel>> {
    return fb.group<ToForm<PmUserManualModel>>({
      id: fb.control(data?.id ?? null),
      projectId: fb.control(data?.projectId ?? null, [Validators.required]),
      manualCode: fb.control(data?.manualCode ?? null, [Validators.required, Validators.maxLength(50)]),
      manualTitle: fb.control(data?.manualTitle ?? null, [Validators.required, Validators.maxLength(255)]),
      manualType: fb.control(data?.manualType ?? 'USER'),
      version: fb.control(data?.version ?? '1.0'),
      relatedSpecId: fb.control(data?.relatedSpecId ?? null),
      deliveryId: fb.control(data?.deliveryId ?? null),
      status: fb.control(data?.status ?? 'DRAFT'),
      attachmentGroupId: fb.control(data?.attachmentGroupId ?? null),
      sections: fb.control(data?.sections ?? []),
      state: fb.control(data?.state ?? null),
      rowVersion: fb.control(data?.rowVersion ?? null),
    });
  }
}
