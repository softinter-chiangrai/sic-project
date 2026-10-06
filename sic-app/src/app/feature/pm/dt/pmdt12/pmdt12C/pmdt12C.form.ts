// src/app/feature/pm/dt/pmdt12/pmdt12C/pmdt12C.form.ts
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

export function createBugForm(fb: FormBuilder): FormGroup {
  return fb.group({
    id: [null],
    taskCode: ['', [Validators.required]],
    taskName: ['', [Validators.required]],
    priority: ['HIGH', [Validators.required]],
    assignedTo: [null],
    estimateManday: [1, [Validators.required, Validators.min(0.5)]],
    startDate: [new Date().toISOString().split('T')[0], [Validators.required]],
    endDate: [new Date(Date.now() + 86400000).toISOString().split('T')[0], [Validators.required]],
    description: ['', [Validators.required]],
    attachmentGroupId: [null],
    testCaseId: [null],
    testCaseCode: [''],
    scenarioId: [null],
    parentTaskId: [null],
    projectId: [null],
    workPackageId: [null],
    specificationId: [null],
  });
}
