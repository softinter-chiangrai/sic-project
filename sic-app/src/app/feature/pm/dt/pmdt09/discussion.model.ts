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