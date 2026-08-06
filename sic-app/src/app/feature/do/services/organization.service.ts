import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface Tag {
  id: string;
  name: string;
  description?: string;
  color_code: string;
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  color_code: string;
  created_at?: string;
  updated_at?: string;
}

export interface Folder {
  id: string;
  name: string;
  description?: string;
  color_code: string;
  parent_id?: string;
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class OrganizationService {
  private orgUrl = `${environment.apiBaseUrl}/api/organization`;

  constructor(private http: HttpClient) {}

  // ─── Tags ──────────────────────────────────────────────────────────────
  getTags(): Observable<Tag[]> {
    return this.http.get<Tag[]>(`${this.orgUrl}/tags`);
  }
  createTag(payload: { name: string; description?: string; color_code: string }): Observable<Tag> {
    return this.http.post<Tag>(`${this.orgUrl}/tags`, payload);
  }
  updateTag(id: string, payload: Partial<{ name: string; description: string; color_code: string }>): Observable<Tag> {
    return this.http.patch<Tag>(`${this.orgUrl}/tags/${id}`, payload);
  }
  deleteTag(id: string): Observable<any> {
    return this.http.delete(`${this.orgUrl}/tags/${id}`);
  }

  // ─── Categories ────────────────────────────────────────────────────────
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.orgUrl}/categories`);
  }
  createCategory(payload: { name: string; description?: string; color_code: string }): Observable<Category> {
    return this.http.post<Category>(`${this.orgUrl}/categories`, payload);
  }
  updateCategory(id: string, payload: Partial<{ name: string; description: string; color_code: string }>): Observable<Category> {
    return this.http.patch<Category>(`${this.orgUrl}/categories/${id}`, payload);
  }
  deleteCategory(id: string): Observable<any> {
    return this.http.delete(`${this.orgUrl}/categories/${id}`);
  }

  // ─── Folders ───────────────────────────────────────────────────────────
  getFolders(): Observable<Folder[]> {
    return this.http.get<Folder[]>(`${this.orgUrl}/folders`);
  }
  createFolder(payload: { name: string; description?: string; color_code: string; parent_id?: string }): Observable<Folder> {
    return this.http.post<Folder>(`${this.orgUrl}/folders`, payload);
  }
  updateFolder(id: string, payload: Partial<{ name: string; description: string; color_code: string; parent_id: string }>): Observable<Folder> {
    return this.http.patch<Folder>(`${this.orgUrl}/folders/${id}`, payload);
  }
  deleteFolder(id: string): Observable<any> {
    return this.http.delete(`${this.orgUrl}/folders/${id}`);
  }
}
