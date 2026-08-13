import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToForm } from '../../../../core/types/form.type';
import { PmBugModel } from '../pmdt10.model';

export class Pmdt10AForm {
  static createForm(fb: FormBuilder): FormGroup<ToForm<PmBugModel>> {
    return fb.group<ToForm<PmBugModel>>({
      id: fb.control(null),
      projectId: fb.control(null),
      bugCode: fb.control(null, [Validators.required, Validators.maxLength(30)]),
      title: fb.control(null, [Validators.required, Validators.maxLength(255)]),
      description: fb.control(null),
      stepsToReproduce: fb.control(null),
      environment: fb.control('Dev'),
      issueType: fb.control('Bug'),
      attachmentGroupId: fb.control(null),
      severity: fb.control('Medium', [Validators.required]),
      priority: fb.control('Medium', [Validators.required]),
      foundBy: fb.control(null),
      assignedTo: fb.control(null),
      foundDate: fb.control(null),
      fixDueDate: fb.control(null),
      fixedDate: fb.control(null),
      status: fb.control('Open'),
      relatedSpec: fb.control(null),
      taskId: fb.control(null),
      taskCode: fb.control(null),
      taskName: fb.control(null),
      testCaseId: fb.control(null),
      testCaseCode: fb.control(null),
      state: fb.control(null),
      rowVersion: fb.control(null),
      createdDate: fb.control(null),
      updatedDate: fb.control(null)
    });
  }
}
