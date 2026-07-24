// src/app/feature/pm/dt/pmdt08/pmdt08.form.ts

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToForm } from '../../../../core/types/form.type';
import { SpecificationModel } from './pmdt08.model';

export class Pmdt08Form {
  static createForm(fb: FormBuilder): FormGroup<ToForm<SpecificationModel>> {
    return fb.group<ToForm<SpecificationModel>>({
      id: fb.control(null),
      projectId: fb.control(null, [Validators.required]),
      projectName: fb.control({ value: null, disabled: true }),
      requirementId: fb.control(null),
      requirementName: fb.control({ value: null, disabled: true }),
      specCode: fb.control(null, [Validators.required, Validators.maxLength(30)]),
      specType: fb.control(null, [Validators.required]),
      title: fb.control(null, [Validators.required, Validators.maxLength(255)]),
      description: fb.control(null, [Validators.maxLength(2000)]),
      relatedRequirement: fb.control(null),
      relatedDiagram: fb.control(null),
      uiAction: fb.control(null),
      validationRule: fb.control(null),
      permission: fb.control(null),
      estimatedManday: fb.control(null, [Validators.min(0)]),
      dependency: fb.control(null),
      status: fb.control('Draft', [Validators.required]),
      version: fb.control({ value: null, disabled: true }),
      isActive: fb.control(true),
      state: fb.control(null),
      rowVersion: fb.control(null),
      approvalStatus: fb.control(null),
    });
  }
}