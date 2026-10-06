import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { DesignReview, ReviewComment } from './pmdt09.model';
import { PaginationResponse } from '../../../../core/model/pagination.model';
import { LanguageService } from '../../../../core/services/language.service';


@Injectable({ providedIn: 'root' })
export class Pmdt09Service {
  private readonly http = inject(HttpClient);
  private readonly languageService = inject(LanguageService);
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

  /** ดึงรายงาน PDF แล้วเปิดแท็บใหม่เพื่อพิมพ์ */
  printPdf(id: string): Observable<Blob> {
    const lang = this.languageService.getCurrentLanguage();
    return this.http.get(`${this.baseUrl}/${id}/export-pdf`, { params: { lang }, responseType: 'blob' }).pipe(
      tap((blob) => {
        const url = URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
        if (!window.open(url, '_blank')) {
          const a = document.createElement('a');
          a.href = url;
          a.target = '_blank';
          a.click();
        }
      }),
    );
  }

  deleteDesignReview(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  addComment(reviewId: string, comment: { commentText: string; commentType?: string; severity?: string; assignedTo?: string }): Observable<ReviewComment> {
    return this.http.post<ReviewComment>(`${this.baseUrl}/${reviewId}/comments`, comment);
  }
}
