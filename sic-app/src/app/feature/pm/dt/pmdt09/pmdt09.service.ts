import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

export interface ReviewComment {
  id: string;
  author: string;
  commentText: string;
  commentType: string;
  severity?: string;
  assignedTo?: string;
  createdAt: string;
}

export interface DesignReview {
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
}

export interface PaginationResponse<T> {
  data: T[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

@Injectable({ providedIn: 'root' })
export class Pmdt09Service {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/pm/design-reviews`;

  getDesignReviews(params?: {
    projectId?: string;
    status?: string;
    keyword?: string;
    page?: number;
    size?: number;
  }): Observable<PaginationResponse<DesignReview>> {
    let httpParams = new HttpParams();
    if (params) {
      if (params.projectId) httpParams = httpParams.set('projectId', params.projectId);
      if (params.status && params.status !== 'all') httpParams = httpParams.set('status', params.status);
      if (params.keyword) httpParams = httpParams.set('keyword', params.keyword);
      if (params.page !== undefined) httpParams = httpParams.set('page', params.page.toString());
      if (params.size !== undefined) httpParams = httpParams.set('size', params.size.toString());
    }
    return this.http.get<PaginationResponse<DesignReview>>(this.baseUrl, { params: httpParams });
  }

  deleteDesignReview(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
