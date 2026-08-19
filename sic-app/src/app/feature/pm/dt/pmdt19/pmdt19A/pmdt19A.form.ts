import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DocumentVersionModel } from './pmdt25.model';
import { ToForm } from '../../../../core/types/form.type';

export class Pmdt25Form {
  static createForm(fb: FormBuilder): FormGroup<ToForm<DocumentVersionModel>> {
    return fb.group<ToForm<DocumentVersionModel>>({
      id: fb.control(null),
      documentType: fb.control(null, [Validators.required]),
      documentId: fb.control(null, [Validators.required]),
      documentCode: fb.control(null),
      projectId: fb.control(null),
      versionNo: fb.control(null, [Validators.required, Validators.maxLength(20)]),
      changeSummary: fb.control(null),
      previousVersionId: fb.control(null),
      approvalStatus: fb.control('DRAFT'),
      approvedBy: fb.control(null),
      approvedDate: fb.control(null),
      snapshotData: fb.control(null),
      fileRefId: fb.control(null),
      filePath: fb.control(null),
      isActive: fb.control(true),
      state: fb.control(null),
      rowVersion: fb.control(null),
    });
  }
}
