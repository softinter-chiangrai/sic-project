// src/app/feature/pm/dt/pmdt13/pmdt13A/pmdt13A.form.ts
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PmTestCaseModel } from './pmdt13A.model';
import { ToForm } from '../../../../../core/types/form.type';

export class Pmdt13AForm {
  static createForm(fb: FormBuilder): FormGroup<ToForm<PmTestCaseModel>> {
    return fb.group<ToForm<PmTestCaseModel>>({
      id: fb.control(null),
      projectId: fb.control(null),
      scenarioId: fb.control(null),
      scenarioName: fb.control(null),
      testCaseCode: fb.control(null, [Validators.required, Validators.maxLength(30)]),
      title: fb.control(null, [Validators.required, Validators.maxLength(255)]),
      priority: fb.control('Medium'),
      testStep: fb.control(null, [Validators.required]),
      expectedResult: fb.control(null, [Validators.required]),
      actualResult: fb.control(null),
      testStatus: fb.control('Pending'),
      tester: fb.control(null),
      testDate: fb.control(null),
      relatedRequirement: fb.control(null),
      relatedSpec: fb.control(null),
      relatedTask: fb.control(null),
      taskId: fb.control(null),
      state: fb.control(null),
      rowVersion: fb.control(null),
      createdDate: fb.control(null),
      updatedDate: fb.control(null),
    });
  }
}
