import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToForm } from '../../../../../core/types/form.type';
import { PmMaTicketModel } from './pmdt17A.model';

export class Pmdt17AForm {
  static createForm(fb: FormBuilder): FormGroup<ToForm<PmMaTicketModel>> {
    return fb.group<ToForm<PmMaTicketModel>>({
      id: fb.control(null),
      projectId: fb.control(null),
      customerId: fb.control(null),
      ticketNo: fb.control(null),
      title: fb.control(null, [Validators.required, Validators.maxLength(200)]),
      description: fb.control(null, [Validators.required]),
      ticketType: fb.control('BUG_SUPPORT', [Validators.required]),
      severity: fb.control('MEDIUM', [Validators.required]),
      status: fb.control(null),
      assignedToIds: fb.control(null),
      startDate: fb.control(null),
      startTime: fb.control(null),
      endDate: fb.control(null),
      endTime: fb.control(null),
      resolutionSummary: fb.control(null),
      isActive: fb.control(true),
      state: fb.control(null),
      rowVersion: fb.control(null),
    });
  }
}
