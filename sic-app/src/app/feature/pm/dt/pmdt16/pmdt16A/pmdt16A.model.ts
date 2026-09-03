import { SicEntityState } from '../../../../../core/model/sic-base-model';

export interface PmInvoiceItemModel {
  id?: string;
  invoiceId?: string;
  itemName: string;
  description?: string;
  amount: number;
  sortOrder?: number;
  state?: SicEntityState | null;
  rowVersion?: number | null;
}

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
  items?: PmInvoiceItemModel[];
  state?: SicEntityState | null;
  rowVersion?: number | null;
}
