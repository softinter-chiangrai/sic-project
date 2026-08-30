// src/app/feature/pm/dt/pmdt04/pmdt04A/pmdt04A.form.ts
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { RequirementModel } from './pmdt04A.model';
import { ToForm } from '../../../../../core/types/form.type';

export class Pmdt04AForm {
  static createForm(fb: FormBuilder): FormGroup<ToForm<RequirementModel>> {
    return fb.group<ToForm<RequirementModel>>({
      id: fb.control(null),
      requirementCode: fb.control(null, [Validators.required, Validators.maxLength(30)]),
      title: fb.control(null, [Validators.required, Validators.maxLength(255)]),
      description: fb.control(null, [Validators.required]),
      requirementType: fb.control(null, [Validators.required]),
      source: fb.control(null, [Validators.maxLength(100)]),
      priority: fb.control('Must', [Validators.required]),
      businessValue: fb.control(null, [Validators.maxLength(255)]),
      acceptanceCriteria: fb.control(null),
      projectId: fb.control(null, [Validators.required]),
      projectName: fb.control(null),
      createdBy: fb.control(null, [Validators.maxLength(100)]),
      baConfirmStatus: fb.control('Pending'),
      customerConfirmStatus: fb.control('Pending'),
      version: fb.control('v1.0'),
      status: fb.control('Draft'),
      isActive: fb.control(true),
      state: fb.control(null),
      rowVersion: fb.control(null),
      uploadGroupId: fb.control(null),
      uploadGroupData: fb.control([]),
    });
  }
}
