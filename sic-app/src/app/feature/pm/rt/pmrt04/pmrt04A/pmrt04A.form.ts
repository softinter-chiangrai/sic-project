// src/app/feature/pm/rt/pmrt04/pmrt04A/pmrt04A.form.ts
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ContractModel } from './pmrt04A.model';
import { ToForm } from '../../../../../core/types/form.type';

export class Pmrt04AForm {
  static createForm(fb: FormBuilder, model?: ContractModel | null): FormGroup<ToForm<ContractModel>> {
    return fb.group<ToForm<ContractModel>>({
      id: fb.control(model?.id ?? null),
      contractNo: fb.control(model?.contractNo ?? null, [Validators.required, Validators.maxLength(50)]),
      contractType: fb.control(model?.contractType ?? null, [Validators.required]),
      customerId: fb.control(model?.customerId ?? null),
      customerName: fb.control(model?.customerName ?? null),
      projectId: fb.control(model?.projectId ?? null),
      projectName: fb.control(model?.projectName ?? null),
      startDate: fb.control(model?.startDate ?? null, [Validators.required]),
      endDate: fb.control(model?.endDate ?? null, [Validators.required]),
      contractValue: fb.control(model?.contractValue ?? null, [Validators.required, Validators.min(0)]),
      paymentTerms: fb.control(model?.paymentTerms ?? null),
      scopeSummary: fb.control(model?.scopeSummary ?? null),
      signStatus: fb.control(model?.signStatus ?? 'Draft'),
      isLocked: fb.control(model?.isLocked ?? false),
      renewalStatus: fb.control(model?.renewalStatus ?? null),
      parentContractId: fb.control(model?.parentContractId ?? null),
      parentContractNo: fb.control(model?.parentContractNo ?? null),
      isActive: fb.control(model?.isActive ?? true),
      state: fb.control(null),
      rowVersion: fb.control(model?.rowVersion ?? null),
      createdAt: fb.control(model?.createdAt ?? null),
      updatedAt: fb.control(model?.updatedAt ?? null),
    });
  }
}

