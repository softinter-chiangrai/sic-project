import { SicEntityState } from '../../../../../core/model/sic-base-model';

export interface PmMaTicketModel {
  id?: string;
  projectId: string;
  customerId: string;
  title: string;
  description: string;
  ticketType: 'BUG_SUPPORT' | 'DATA_ISSUE' | 'USER_SUPPORT' | 'CHANGE_REQUEST';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'IN_PROGRESS' | 'WAITING_CUSTOMER' | 'RESOLVED' | 'CLOSED';
  approvalStatus?: string;
  assignedTo?: string;
  resolutionSummary?: string;
  isActive?: boolean;
  state?: SicEntityState | null;
  rowVersion?: number | null;
}
