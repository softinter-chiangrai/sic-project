import { SicFromData } from '../../../../../core/model/sic-from-data';

export interface ReviewCommentModel {
  id: string;
  author: string;
  text: string;
  type: string;
  createdAt: string;
}

export interface DesignReviewModel {
  id: string;
  reviewCode: string;
  title: string;
  description: string;
  projectId: string;
  projectName?: string;
  reviewableType?: string;
  reviewableId: string;
  reviewableName?: string;
  reviewer?: string;
  assignedTo?: string;
  severity: string;
  status: string;
  isLocked?: boolean;
  dueDate: string;
  figmaUrl?: string;
  embedMode?: 'design' | 'prototype';
  approvalFlowId?: string;
  isActive: boolean;
  comments?: ReviewCommentModel[];
  state?: number;
  rowVersion?: number;
}

export interface Pmdt09APageData {
  formData: SicFromData<DesignReviewModel>;
  isEdit: boolean;
  reviewId: string | null;
}
