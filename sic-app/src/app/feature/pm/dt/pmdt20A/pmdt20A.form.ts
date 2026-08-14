import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PmPaymentModel } from './pmdt20A.model';
import { ToForm } from '../../../../core/types/form.type';

export class Pmdt20AForm {
  static createForm(fb: FormBuilder): FormGroup<ToForm<PmPaymentModel>> {
    return fb.group<ToForm<PmPaymentModel>>({
      id: fb.control(null),
      paymentNo: fb.control(null),
      invoiceId: fb.control(null, [Validators.required]),
      invoiceNo: fb.control(null),
      customerId: fb.control(null),
      customerName: fb.control(null),
      projectId: fb.control(null),
      projectName: fb.control(null),
      paymentDate: fb.control(new Date().toISOString().substring(0, 10), [Validators.required]),
      paymentMethod: fb.control('BANK_TRANSFER', [Validators.required]),
      amount: fb.control(0, [Validators.required, Validators.min(0.01)]),
      referenceNo: fb.control(null),
      bankName: fb.control(null),
      receiptFile: fb.control(null),
      paymentStatus: fb.control('PAID'),
      notes: fb.control(null),
      state: fb.control(null),
      rowVersion: fb.control(null),
    });
  }
}
