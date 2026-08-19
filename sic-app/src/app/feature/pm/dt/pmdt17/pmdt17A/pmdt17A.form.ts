import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToForm } from '../../../../../core/types/form.type';
import { PmMaTicketModel } from './pmdt17A.model';

export class Pmdt17AForm {
  static createForm(fb: FormBuilder): FormGroup<ToForm<PmMaTicketModel>> {
    return fb.group<ToForm<PmMaTicketModel>>({
      id: fb.control(null),
      projectId: fb.control(null, [Validators.required]),
      customerId: fb.control(null, [Validators.required]),
      title: fb.control(null, [Validators.required, Validators.maxLength(200)]),
      description: fb.control(null, [Validators.required]),
      ticketType: fb.control('BUG_SUPPORT', [Validators.required]),
      severity: fb.control('MEDIUM', [Validators.required]),
      status: fb.control('OPEN', [Validators.required]),
      assignedTo: fb.control(null),
      resolutionSummary: fb.control(null),
      isActive: fb.control(true),
      state: fb.control(null),
      rowVersion: fb.control(null),
    });
  }
}
