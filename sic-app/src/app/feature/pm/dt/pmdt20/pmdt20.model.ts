import { SicBaseStateModel } from '../../../../core/model/sic-base-model';
import { SicFromData } from '../../../../core/model/sic-from-data';

export interface PmInvoiceFormData {
  invoice: SicFromData<PmInvoiceModel>;
}

export interface PmInvoiceModel extends SicBaseStateModel {
  id: string;
  invoiceNo: string;
  customerId: string;
  customerName?: string;
  projectId: string;
  projectName?: string;
  contractId?: string;
  contractNo?: string;
  deliveryId?: string;
  milestoneId?: string;
  billingType: string;
  issueDate: string;
  dueDate: string;
  subtotalAmount: number;
  vatRate: number;
  vatAmount: number;
  totalAmount: number;
  paidAmount: number;
  paymentStatus: string;
  approvalStatus: string;
  receiptFileRef?: string;
  remark?: string;
}
