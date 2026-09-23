import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToForm } from '../../../../../core/types/form.type';
import { DesignReviewModel } from './pmdt09A.model';

export class Pmdt09AForm {
  static createForm(fb: FormBuilder): FormGroup<ToForm<DesignReviewModel>> {
    return fb.group<ToForm<DesignReviewModel>>({
      id: fb.control(null),
      reviewCode: fb.control(null, [Validators.required, Validators.maxLength(30)]),
      title: fb.control(null, [Validators.required, Validators.maxLength(255)]),
      description: fb.control(null, [Validators.required]),
      reviewableType: fb.control(null),
      reviewableId: fb.control(null),
      reviewableName: fb.control(null),
      projectId: fb.control(null, [Validators.required]),
      projectName: fb.control(null),
      reviewer: fb.control(null),
      assignedTo: fb.control(null, [Validators.required]),
      severity: fb.control('Medium', [Validators.required]),
      status: fb.control('Open', [Validators.required]),
      dueDate: fb.control(null, [Validators.required]),
      figmaUrl: fb.control(null),
      embedMode: fb.control('design'),
      approvalFlowId: fb.control(null),
      isActive: fb.control(true),
      comments: fb.control([]),
      state: fb.control(null),
      rowVersion: fb.control(null),
    });
  }
}
