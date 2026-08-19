// src/app/feature/pm/dt/pmdt08/pmdt08A/pmdt08A.form.ts
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

export class Pmdt08AForm {
  static createForm(fb: FormBuilder): FormGroup {
    return fb.group({
      id: [null],
      specificationCode: [null, [Validators.required, Validators.maxLength(50)]],
      specificationType: [null, [Validators.required]],
      title: [null, [Validators.required, Validators.maxLength(255)]],
      module: [null, [Validators.maxLength(100)]],
      version: [{ value: 'v1.0', disabled: true }],
      status: ['Draft'],
      priority: ['Medium'],
      owner: [null, [Validators.maxLength(100)]],
      estimatedManday: [null, [Validators.min(0)]],
      description: [null, [Validators.required]],
      uploadGroupId: [null],
      isAiGenerated: [false],
      aiGeneratedAt: [null],
      requirementId: [null],
      generatedFromRequirementId: [null],
      generatedFromDiagramId: [null],
      projectId: [null],
      projectName: [null],
      createdBy: [null],
      createdDate: [null],
      createdAt: [null],
      isActive: [true],
      state: [null],
      rowVersion: [null],
    });
  }
}
