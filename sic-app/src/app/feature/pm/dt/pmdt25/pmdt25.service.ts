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

  // ===== Get all versions of a document =====
  getVersions(documentType: string, documentId: string): Observable<DocumentVersionModel[]> {
    const params = new HttpParams()
      .set('documentType', documentType)
      .set('documentId', documentId);
    return this.http.get<DocumentVersionModel[]>(this.apiUrl, { params });
  }

  // ===== Get a specific version by ID =====
  getVersion(id: string): Observable<DocumentVersionModel> {
    return this.http.get<DocumentVersionModel>(`${this.apiUrl}/${id}`);
  }

  // ===== Create or update a document version =====
  saveVersion(data: Partial<DocumentVersionModel>): Observable<string> {
    return this.http.post<string>(this.apiUrl, data);
  }

  // ===== Delete a document version (soft delete) =====
  deleteVersion(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // ===== Delete all versions of a document =====
  deleteVersionsByDocument(documentType: string, documentId: string): Observable<void> {
    const params = new HttpParams()
      .set('documentType', documentType)
      .set('documentId', documentId);
    return this.http.delete<void>(this.apiUrl, { params });
  }

  // ===== Search versions with filters (optional) =====
  searchVersions(params: {
    documentType?: string;
    documentId?: string;
    keyword?: string;
    page?: number;
    size?: number;
  }): Observable<any> {
    let httpParams = new HttpParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        httpParams = httpParams.set(key, String(value));
      }
    });
    return this.http.get<any>(`${this.apiUrl}/search`, { params: httpParams });
  }
}