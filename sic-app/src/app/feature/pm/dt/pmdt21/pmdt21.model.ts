import { SicBaseStateModel } from '../../../../core/model/sic-base-model';
import { SicFromData } from '../../../../core/model/sic-from-data';

export interface PmMaTicketFormData {
  ticket: SicFromData<PmMaTicketModel>;
}

export interface PmMaTicketModel extends SicBaseStateModel {
  id: string;
  ticketNo: string;
  customerId: string;
  customerName?: string;
  projectId: string;
  projectName?: string;
  contractId?: string;
  contractNo?: string;
  ticketType: string;
  title: string;
  description: string;
  severity: string;
  status: string;
  assignedTo?: string;
  reportedBy?: string;
  reportedDate?: string;
  targetResponseDate?: string;
  targetResolveDate?: string;
  resolvedDate?: string;
  closedDate?: string;
  resolutionSummary?: string;
}
