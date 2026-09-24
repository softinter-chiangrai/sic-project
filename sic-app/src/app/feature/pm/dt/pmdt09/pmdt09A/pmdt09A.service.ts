import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { environment } from '../../../../../../environments/environment';
import { DesignReviewModel, ReviewCommentModel } from './pmdt09A.model';

@Injectable({ providedIn: 'root' })
export class Pmdt09AService {
  private readonly http = inject(HttpClient);
  private readonly translate = inject(TranslateService);

  apiGetComboboxCustomer = `${environment.apiBaseUrl}/api/pm/customers/combobox`;
  apiGetComboboxProject = `${environment.apiBaseUrl}/api/pm/customer-projects/combobox`;
  apiGetComboboxReviewable = `${environment.apiBaseUrl}/api/pm/design-reviews/combobox-specification`;
  apiGetComboboxSpecification = `${environment.apiBaseUrl}/api/pm/design-reviews/combobox-specification`;
  apiGetComboboxRequirement = `${environment.apiBaseUrl}/api/pm/design-reviews/combobox-requirement`;
  apiGetComboboxTask = `${environment.apiBaseUrl}/api/pm/design-reviews/combobox-task`;
  apiGetComboboxUser = `${environment.apiBaseUrl}/api/pm/design-reviews/combobox-user`;
  apiGetUsers = `${environment.apiBaseUrl}/api/pm/design-reviews/combobox-user`;
  apiGetApprovalFlows = `${environment.apiBaseUrl}/api/pm/approvals/flows/document-type/DESIGN_REVIEW`;
  apiGetLovSeverity = `${environment.apiBaseUrl}/api/pm/design-reviews/lov-severity`;
  apiGetLovStatus = `${environment.apiBaseUrl}/api/pm/design-reviews/lov-status`;

  get severityOptions() {
    return [
      { value: 'Low', label: this.translate.instant('PMDT09_SEV_LOW') },
      { value: 'Medium', label: this.translate.instant('PMDT09_SEV_MEDIUM') },
      { value: 'High', label: this.translate.instant('PMDT09_SEV_HIGH') },
      { value: 'Critical', label: this.translate.instant('PMDT09_SEV_CRITICAL') },
    ];
  }

  get statusOptions() {
    return [
      { value: 'Open', label: this.translate.instant('PMDT09_ST_OPEN') },
      { value: 'In Progress', label: this.translate.instant('PMDT09_ST_INPROGRESS') },
      { value: 'Resolved', label: this.translate.instant('PMDT09_ST_RESOLVED') },
      { value: 'Closed', label: this.translate.instant('PMDT09_ST_CLOSED') },
    ];
  }

  save(data: DesignReviewModel): Observable<any> {
    return this.http.post(`${environment.apiBaseUrl}/api/pm/design-reviews`, data);
  }

  getDesignReview(id: string): Observable<DesignReviewModel> {
    return this.http.get<DesignReviewModel>(`${environment.apiBaseUrl}/api/pm/design-reviews/${id}`);
  }

  addComment(reviewId: string, text: string, type = 'GENERAL'): Observable<ReviewCommentModel> {
    return this.http.post<ReviewCommentModel>(
      `${environment.apiBaseUrl}/api/pm/design-reviews/${reviewId}/comments`,
      { text, type },
    );
  }

  deleteComment(reviewId: string, commentId: string): Observable<void> {
    return this.http.delete<void>(
      `${environment.apiBaseUrl}/api/pm/design-reviews/${reviewId}/comments/${commentId}`,
    );
  }
}
