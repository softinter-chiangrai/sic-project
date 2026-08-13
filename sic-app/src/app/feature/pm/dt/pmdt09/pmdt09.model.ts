// src/app/feature/pm/dt/pmdt09/pmdt09.model.ts
import { SicBaseStateModel, PaginationResponse } from '../../../../core/model/sic-base-model';
import { SicFromData } from '../../../../core/model/sic-from-data';

export interface Pmdt09Model extends SicBaseStateModel {
  id: string;
  projectId: string;
  topic: string;
  content?: string;
  category?: string;
  author?: string;
  createdDate?: string;
}

export interface Pmdt09PageData {
  discussionData: SicFromData<Pmdt09Model>;
}

export { PaginationResponse };

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface Post {
  id: string;
  subject: string;
  content: string;
  createdBy: string;
  createdByName: string;
  createdDate: string;
  attachmentGroupId?: string;
  pinned: boolean;
  replyCount: number;
  userAvatarUrl?: string;
  replies?: Reply[];
  isEditing?: boolean;
}

export interface Reply {
  id: string;
  content: string;
  createdBy: string;
  createdByName: string;
  createdDate: string;
  attachmentGroupId?: string;
  userAvatarUrl?: string;
  replyToUser?: string;
  isEditing?: boolean;
}

export interface CreatePostRequest {
  targetId: string;
  subject: string;
  content: string;
  attachmentGroupId?: string;
  pinned?: boolean;
}

export interface CreateReplyRequest {
  postId: string;
  content: string;
  attachmentGroupId?: string;
}

export interface UpdateCommentRequest {
  content: string;
}

export interface AttachmentFile {
  id: string;
  fileName: string;
  accessUrl: string;
  fileSize: number;
  contentType: string;
}
