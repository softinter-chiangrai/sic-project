// src/app/feature/pm/dt/pmdt25/pmdt25.service.ts
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { DocumentVersionModel } from './pmdt25.model';

@Injectable({ providedIn: 'root' })
export class Pmdt25Service {
  private http = inject(HttpClient);
  private apiUrl = environment.apiBaseUrl + '/api/pm/document-versions';

  // ✅ LOV API Endpoints
  apiGetLovDocumentType = environment.apiBaseUrl + '/api/db/parameter/lov?group=PM&parameterCode=DOCUMENT_TYPE';
  apiGetLovStatus = environment.apiBaseUrl + '/api/db/parameter/lov?group=COMMON&parameterCode=DOC_STATUS';

  // ===== CRUD =====
  getVersions(documentType: string, documentId: string): Observable<DocumentVersionModel[]> {
    const params = new HttpParams()
      .set('documentType', documentType)
      .set('documentId', documentId);
    return this.http.get<DocumentVersionModel[]>(this.apiUrl, { params });
  }

  getVersion(id: string): Observable<DocumentVersionModel> {
    return this.http.get<DocumentVersionModel>(`${this.apiUrl}/${id}`);
  }

  saveVersion(data: Partial<DocumentVersionModel>): Observable<string> {
    return this.http.post<string>(this.apiUrl, data);
  }

  deleteVersion(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  deleteVersionsByDocument(documentType: string, documentId: string): Observable<void> {
    const params = new HttpParams()
      .set('documentType', documentType)
      .set('documentId', documentId);
    return this.http.delete<void>(this.apiUrl, { params });
  }

  // ===== Combobox สำหรับ Document ID (ตามประเภท) =====
  getComboboxDocuments(documentType: string): Observable<{ value: string; text: string }[]> {
    const params = new HttpParams().set('documentType', documentType);
    return this.http.get<{ value: string; text: string }[]>(
      `${this.apiUrl}/combobox`,
      { params }
    );
  }
}