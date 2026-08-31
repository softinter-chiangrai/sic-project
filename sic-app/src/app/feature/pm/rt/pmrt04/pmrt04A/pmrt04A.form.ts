// src/app/feature/pm/rt/pmrt04/pmrt04A/pmrt04A.form.ts
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ContractModel } from './pmrt04A.model';
import { ToForm } from '../../../../../core/types/form.type';

export class Pmrt04AForm {
  static createForm(fb: FormBuilder): FormGroup<ToForm<ContractModel>> {
    return fb.group<ToForm<ContractModel>>({
      id: fb.control(null),
      contractNo: fb.control(null, [Validators.required, Validators.maxLength(50)]),
      contractType: fb.control(null, [Validators.required]),
      customerId: fb.control(null),
      customerName: fb.control(null),
      projectId: fb.control(null),
      projectName: fb.control(null),
      startDate: fb.control(null, [Validators.required]),
      endDate: fb.control(null, [Validators.required]),
      contractValue: fb.control(null, [Validators.required, Validators.min(0)]),
      paymentTerms: fb.control(null),
      scopeSummary: fb.control(null),
      signStatus: fb.control('Draft'),
      renewalStatus: fb.control(null),
      parentContractId: fb.control(null),
      parentContractNo: fb.control(null),
      isActive: fb.control(true),
      state: fb.control(null),
      rowVersion: fb.control(null),
      createdAt: fb.control(null),
      updatedAt: fb.control(null),
    });
  }
}

