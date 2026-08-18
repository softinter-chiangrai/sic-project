import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToForm } from '../../../../../core/types/form.type';
import { PmInvoiceModel } from './pmdt20A.model';

export class Pmdt20AForm {
  static createForm(fb: FormBuilder): FormGroup<ToForm<PmInvoiceModel>> {
    return fb.group<ToForm<PmInvoiceModel>>({
      id: fb.control(null),
      projectId: fb.control(null, [Validators.required]),
      customerId: fb.control(null, [Validators.required]),
      contractId: fb.control(null),
      milestoneId: fb.control(null),
      invoiceNo: fb.control(null, [Validators.maxLength(50)]),
      issueDate: fb.control(new Date().toISOString().split('T')[0], [Validators.required]),
      dueDate: fb.control(null, [Validators.required]),
      billingType: fb.control('MILESTONE', [Validators.required]),
      subtotalAmount: fb.control(0, [Validators.required, Validators.min(0)]),
      vatRate: fb.control(7, [Validators.min(0)]),
      vatAmount: fb.control(0),
      totalAmount: fb.control(0),
      paymentStatus: fb.control('UNPAID', [Validators.required]),
      paidAmount: fb.control(0),
      paidDate: fb.control(null),
      receiptGroupId: fb.control(null),
      remark: fb.control(null),
      isActive: fb.control(true),
      state: fb.control(null),
      rowVersion: fb.control(null),
    });
  }
}
