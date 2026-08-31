import { SicBaseStateModel } from '../../../../core/model/sic-base-model';
import { SicFromData } from '../../../../core/model/sic-from-data';

export interface ReviewComment {
  id: string;
  author: string;
  commentText: string;
  commentType: string;
  severity?: string;
  assignedTo?: string;
  createdAt: string;
}

export interface DesignReview extends SicBaseStateModel {
  id: string;
  reviewCode: string;
  title: string;
  description: string;
  projectId: string;
  projectCode?: string;
  projectName?: string;
  reviewableType: string;
  reviewableId?: string;
  reviewableName?: string;
  reviewer: string;
  assignedTo: string;
  severity: string;
  status: string;
  dueDate: string;
  figmaUrl?: string;
  embedMode?: 'design' | 'prototype';
  isActive: boolean;
  createdDate?: string;
  createdBy?: string;
  comments?: ReviewComment[];
  approvalStatus?: string;
}

export interface PaginationResponse<T> {
  data: T[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

export interface Pmdt09Model extends SicBaseStateModel {
  id?: string;
  code?: string;
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface Pmdt09PageData {
  formData?: SicFromData<Pmdt09Model>;
  detail?: any;
  items?: any[];
}
