import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface DocumentItem {
  id: string;
  file_name: string;
  status: string;
  tags: string;
  category: string;
  folder: string;
  folder_ids?: string[];
  created_at?: string;
  owner?: string;
  description?: string;
}

export interface DocumentListResponse {
  total: number;
  documents: DocumentItem[];
}

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private apiUrl = `${environment.apiBaseUrl}/api/document`;

  constructor(private http: HttpClient) {}

  getDocuments(): Observable<DocumentListResponse> {
    return this.http.get<DocumentListResponse>(this.apiUrl);
  }

  uploadDocuments(files: File[], folderId?: string, categoryId?: string, tagIds?: string): Observable<any> {
    const formData = new FormData();
    for (const file of files) {
      formData.append('files', file, file.name);
    }
    if (folderId) formData.append('folder_id', folderId);
    if (categoryId) formData.append('category_id', categoryId);
    if (tagIds) formData.append('tag_ids', tagIds);
    return this.http.post(`${this.apiUrl}/upload`, formData);
  }

  updateDocument(id: string, payload: { file_name?: string, description?: string }): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}`, payload);
  }

  deleteDocument(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  downloadUrl(id: string): string {
    return `${this.apiUrl}/${id}/download`;
  }

  downloadFileBlob(id: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/download`, { responseType: 'blob' });
  }

  viewFileBlob(id: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/view`, { responseType: 'blob' });
  }
}
