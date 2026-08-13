import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToForm } from '../../../../core/types/form.type';
import { PmInvoiceModel } from './pmdt20.model';

export class Pmdt20Form {
  static createForm(fb: FormBuilder): FormGroup<ToForm<PmInvoiceModel>> {
    return fb.group<ToForm<PmInvoiceModel>>({
      id: fb.control(null),
      invoiceNo: fb.control(null),
      customerId: fb.control(null, [Validators.required]),
      customerName: fb.control(null),
      projectId: fb.control(null, [Validators.required]),
      projectName: fb.control(null),
      contractId: fb.control(null),
      contractNo: fb.control(null),
      deliveryId: fb.control(null),
      milestoneId: fb.control(null),
      billingType: fb.control('MILESTONE', [Validators.required]),
      issueDate: fb.control(new Date().toISOString().substring(0, 10), [Validators.required]),
      dueDate: fb.control(new Date(Date.now() + 30 * 86400000).toISOString().substring(0, 10), [Validators.required]),
      subtotalAmount: fb.control(0, [Validators.required, Validators.min(0)]),
      vatRate: fb.control(7.00),
      vatAmount: fb.control(0),
      totalAmount: fb.control(0),
      paidAmount: fb.control(0),
      paymentStatus: fb.control('UNPAID'),
      approvalStatus: fb.control('DRAFT'),
      receiptFileRef: fb.control(null),
      remark: fb.control(null),
      state: fb.control(null),
      rowVersion: fb.control(null),
    });
  }
}
