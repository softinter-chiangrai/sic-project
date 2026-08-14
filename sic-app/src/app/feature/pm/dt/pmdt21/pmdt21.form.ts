import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PmMaTicketModel } from './pmdt21.model';
import { ToForm } from '../../../../core/types/form.type';

export class Pmdt21Form {
  static createForm(fb: FormBuilder): FormGroup<ToForm<PmMaTicketModel>> {
    return fb.group<ToForm<PmMaTicketModel>>({
      id: fb.control(null),
      ticketNo: fb.control(null),
      customerId: fb.control(null, [Validators.required]),
      customerName: fb.control(null),
      projectId: fb.control(null, [Validators.required]),
      projectName: fb.control(null),
      contractId: fb.control(null),
      contractNo: fb.control(null),
      ticketType: fb.control('BUG_SUPPORT', [Validators.required]),
      title: fb.control(null, [Validators.required, Validators.maxLength(255)]),
      description: fb.control(null, [Validators.required]),
      severity: fb.control('MEDIUM', [Validators.required]),
      status: fb.control('OPEN', [Validators.required]),
      assignedTo: fb.control(null),
      reportedBy: fb.control('Customer'),
      reportedDate: fb.control(null),
      targetResponseDate: fb.control(null),
      targetResolveDate: fb.control(null),
      resolvedDate: fb.control(null),
      closedDate: fb.control(null),
      resolutionSummary: fb.control(null),
      state: fb.control(null),
      rowVersion: fb.control(null),
    });
  }
}
