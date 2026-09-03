import { SicEntityState } from '../../../../../core/model/sic-base-model';

export interface PmInvoiceModel {
  id?: string;
  projectId: string;
  customerId: string;
  contractId?: string;
  milestoneId?: string;
  invoiceNo?: string;
  issueDate: string;
  dueDate: string;
  billingType: string;
  subtotalAmount: number;
  vatRate: number;
  vatAmount: number;
  totalAmount: number;
  paymentStatus: string;
  approvalStatus?: string;
  paidAmount?: number;
  paidDate?: string;
  receiptGroupId?: string;
  remark?: string;
  isActive?: boolean;
  state?: SicEntityState | null;
  rowVersion?: number | null;
}
