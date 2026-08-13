import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToForm } from '../../../../core/types/form.type';
import { PmMaRenewalModel } from './pmdt22.model';

export class Pmdt22Form {
  static createForm(fb: FormBuilder): FormGroup<ToForm<PmMaRenewalModel>> {
    return fb.group<ToForm<PmMaRenewalModel>>({
      id: fb.control(null),
      renewalNo: fb.control(null),
      contractId: fb.control(null, [Validators.required]),
      contractNo: fb.control(null),
      customerId: fb.control(null, [Validators.required]),
      customerName: fb.control(null),
      projectId: fb.control(null, [Validators.required]),
      projectName: fb.control(null),
      currentEndDate: fb.control(new Date().toISOString().substring(0, 10), [Validators.required]),
      newStartDate: fb.control(new Date().toISOString().substring(0, 10), [Validators.required]),
      newEndDate: fb.control(new Date(Date.now() + 365 * 86400000).toISOString().substring(0, 10), [Validators.required]),
      proposedAmount: fb.control(0, [Validators.required, Validators.min(0)]),
      status: fb.control('DRAFT', [Validators.required]),
      newContractId: fb.control(null),
      remark: fb.control(null),
      state: fb.control(null),
      rowVersion: fb.control(null),
    });
  }
}
