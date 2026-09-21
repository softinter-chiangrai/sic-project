// src/app/feature/pm/rt/pmrt02/pmrt02A/pmrt02A.form.ts
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Pmrt02AModel } from './pmrt02A.model';
import { ToForm } from '../../../../../core/types/form.type';

export class Pmrt02AForm {
  static createForm(fb: FormBuilder, model?: Pmrt02AModel | null): FormGroup<ToForm<Pmrt02AModel>> {
    return fb.group<ToForm<Pmrt02AModel>>({
      id: fb.control(model?.id ?? null),
      projectCode: fb.control(model?.projectCode ?? null, [Validators.required, Validators.maxLength(30)]),
      projectName: fb.control(model?.projectName ?? null, [Validators.required, Validators.maxLength(255)]),
      customerId: fb.control(model?.customerId ?? null, [Validators.required]),
      customerName: fb.control(model?.customerName ?? null),
      contractId: fb.control(model?.contractId ?? null),
      contractNo: fb.control(model?.contractNo ?? null),
      startDate: fb.control(model?.startDate ?? null, [Validators.required]),
      plannedEndDate: fb.control(model?.plannedEndDate ?? null, [Validators.required]),
      actualEndDate: fb.control(model?.actualEndDate ?? null),
      budgetManday: fb.control(model?.budgetManday ?? null, [Validators.required, Validators.min(0)]),
      usedManday: fb.control(model?.usedManday ?? 0, [Validators.min(0)]),
      status: fb.control(model?.status ?? 'Prospect', [Validators.required]),
      priority: fb.control(model?.priority ?? 'Medium', [Validators.required]),
      description: fb.control(model?.description ?? null),
      isActive: fb.control(model?.isActive ?? true),
      approvalFlowId: fb.control(model?.approvalFlowId ?? null),
      approvalStatus: fb.control(model?.approvalStatus ?? null),
      isApproved: fb.control(model?.isApproved ?? false),
      isLocked: fb.control(model?.isLocked ?? false),
      createdAt: fb.control(model?.createdAt ?? null),
      state: fb.control(null),
      rowVersion: fb.control(model?.rowVersion ?? null),
    });
  }
}
