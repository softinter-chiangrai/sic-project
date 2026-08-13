import { SicBaseStateModel } from '../../../../core/model/sic-base-model';
import { SicFromData } from '../../../../core/model/sic-from-data';

export interface PmPaymentFormData {
  payment: SicFromData<PmPaymentModel>;
}

export interface PmPaymentModel extends SicBaseStateModel {
  id: string;
  paymentNo: string;
  invoiceId: string;
  invoiceNo?: string;
  customerId?: string;
  customerName?: string;
  projectId?: string;
  projectName?: string;
  paymentDate: string;
  paymentMethod: string;
  amount: number;
  referenceNo?: string;
  bankName?: string;
  receiptFile?: string;
  paymentStatus: string;
  notes?: string;
}
