// src/app/feature/pm/dt/pmdt12/pmdt12B/pmdt12B.form.ts
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PmTestScenarioModel } from './pmdt12B.model';
import { ToForm } from '../../../../../core/types/form.type';

export class Pmdt12BForm {
  static createForm(fb: FormBuilder): FormGroup<ToForm<PmTestScenarioModel>> {
    return fb.group<ToForm<PmTestScenarioModel>>({
      id: fb.control(null),
      projectId: fb.control(null),
      testPlanId: fb.control(null),
      taskId: fb.control(null),
      taskCode: fb.control(null),
      taskName: fb.control(null),
      scenarioCode: fb.control(null, [Validators.required, Validators.maxLength(50)]),
      scenarioName: fb.control(null, [Validators.required, Validators.maxLength(255)]),
      priority: fb.control('Medium'),
      description: fb.control(null),
      status: fb.control('Active'),
      state: fb.control(null),
      rowVersion: fb.control(null),
      createdDate: fb.control(null),
      updatedDate: fb.control(null),
    });
  }
}
