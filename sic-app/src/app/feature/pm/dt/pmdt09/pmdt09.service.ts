import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { DesignReview, PaginationResponse, ReviewComment } from './pmdt09.model';


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

  addComment(reviewId: string, comment: { commentText: string; commentType?: string; severity?: string; assignedTo?: string }): Observable<ReviewComment> {
    return this.http.post<ReviewComment>(`${this.baseUrl}/${reviewId}/comments`, comment);
  }
}
