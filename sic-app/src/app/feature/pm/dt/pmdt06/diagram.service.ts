// src/app/core/services/diagram.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import type { ChatMessage, DiagramModel, DiagramProject, DiagramType, DiagramVersion } from './diagram.model';
import { environment } from '../../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DiagramService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiBaseUrl;

  private projectsSubject = new BehaviorSubject<DiagramProject[]>([]);
  private tabsSubject = new BehaviorSubject<DiagramModel[]>([]);
  private activeTabIdSubject = new BehaviorSubject<string | null>(null);

  projects$ = this.projectsSubject.asObservable();
  tabs$ = this.tabsSubject.asObservable();
  activeTabId$ = this.activeTabIdSubject.asObservable();

  // ==================== Projects ====================
  getProjects(): Observable<DiagramProject[]> {
    return this.http.get<DiagramProject[]>(`${this.apiUrl}/api/diagram/projects`).pipe(
      tap(projects => this.projectsSubject.next(projects))
    );
  }

  createProject(name: string, description?: string): Observable<DiagramProject> {
    return this.http.post<DiagramProject>(`${this.apiUrl}/api/diagram/projects`, { name, description }).pipe(
      tap(project => {
        const current = this.projectsSubject.value;
        this.projectsSubject.next([...current, project]);
      })
    );
  }

  updateProject(id: string, data: Partial<DiagramProject>): Observable<DiagramProject> {
    return this.http.put<DiagramProject>(`${this.apiUrl}/api/diagram/projects/${id}`, data).pipe(
      tap(updated => {
        const current = this.projectsSubject.value;
        this.projectsSubject.next(current.map(p => p.id === id ? updated : p));
      })
    );
  }

  deleteProject(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/api/diagram/projects/${id}`).pipe(
      tap(() => {
        const current = this.projectsSubject.value;
        this.projectsSubject.next(current.filter(p => p.id !== id));
      })
    );
  }

  // ==================== Tabs (Diagrams) ====================
  getTabs(projectId: string): Observable<DiagramModel[]> {
    return this.http.get<DiagramModel[]>(`${this.apiUrl}/api/diagram/tabs?projectId=${projectId}`).pipe(
      tap(tabs => this.tabsSubject.next(tabs))
    );
  }

  createTab(projectId: string, name: string, type: DiagramType, script?: string): Observable<DiagramModel> {
    const payload = {
      projectId,
      name,
      diagramType: type,
      mermaidScript: script || '',
      metadata: {},
      sortOrder: this.tabsSubject.value.length + 1,
    };
    return this.http.post<DiagramModel>(`${this.apiUrl}/api/diagram/tabs`, payload).pipe(
      tap(tab => {
        const current = this.tabsSubject.value;
        this.tabsSubject.next([...current, tab]);
      })
    );
  }

  updateTab(tab: DiagramModel): Observable<DiagramModel> {
    return this.http.put<DiagramModel>(`${this.apiUrl}/api/diagram/tabs/${tab.id}`, tab).pipe(
      tap(updated => {
        const current = this.tabsSubject.value;
        this.tabsSubject.next(current.map(t => t.id === updated.id ? updated : t));
      })
    );
  }

  deleteTab(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/api/diagram/tabs/${id}`).pipe(
      tap(() => {
        const current = this.tabsSubject.value;
        this.tabsSubject.next(current.filter(t => t.id !== id));
      })
    );
  }

  reorderTabs(tabs: { id: string; sortOrder: number }[]): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/api/diagram/tabs/reorder`, { tabs }).pipe(
      tap(() => {
        const current = this.tabsSubject.value;
        const updated = current.map(t => {
          const order = tabs.find(o => o.id === t.id);
          return order ? { ...t, sortOrder: order.sortOrder } : t;
        });
        this.tabsSubject.next(updated.sort((a, b) => a.sortOrder - b.sortOrder));
      })
    );
  }

  duplicateTab(id: string): Observable<DiagramModel> {
    return this.http.post<DiagramModel>(`${this.apiUrl}/api/diagram/tabs/${id}/duplicate`, {});
  }

  // ==================== Versions ====================
  getVersions(tabId: string): Observable<DiagramVersion[]> {
    return this.http.get<DiagramVersion[]>(`${this.apiUrl}/api/diagram/tabs/${tabId}/versions`);
  }

  restoreVersion(tabId: string, versionId: string): Observable<DiagramModel> {
    return this.http.post<DiagramModel>(`${this.apiUrl}/api/diagram/tabs/${tabId}/restore/${versionId}`, {});
  }

  // ==================== Chat ====================
  getChatHistory(tabId: string): Observable<ChatMessage[]> {
    return this.http.get<ChatMessage[]>(`${this.apiUrl}/api/diagram/chat/${tabId}/history`);
  }

  sendChatMessage(tabId: string, message: string): Observable<{ message: ChatMessage; diagram?: DiagramModel; action?: 'create' | 'update' }> {
    return this.http.post<{ message: ChatMessage; diagram?: DiagramModel; action?: 'create' | 'update' }>(`${this.apiUrl}/api/diagram/chat`, { tabId, message });
  }

  clearChatHistory(tabId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/api/diagram/chat/${tabId}/history`);
  }

  // ==================== AI ====================
  generateDiagram(prompt: string, context?: any): Observable<{ script: string; type: DiagramType; name: string }> {
    return this.http.post<{ script: string; type: DiagramType; name: string }>(`${this.apiUrl}/api/diagram/ai/generate`, { prompt, context });
  }

  improveDiagram(script: string, instruction: string): Observable<{ script: string }> {
    return this.http.post<{ script: string }>(`${this.apiUrl}/api/diagram/ai/improve`, { script, instruction });
  }

  fixDiagram(script: string, errorMessage: string): Observable<{ script: string }> {
    return this.http.post<{ script: string }>(`${this.apiUrl}/api/diagram/ai/fix`, { script, errorMessage });
  }

  convertDiagram(script: string, targetType: DiagramType): Observable<{ script: string; type: DiagramType }> {
    return this.http.post<{ script: string; type: DiagramType }>(`${this.apiUrl}/api/diagram/ai/convert`, { script, targetType });
  }

  // ==================== Export ====================
  exportDiagram(id: string, format: 'png' | 'svg' | 'pdf' | 'md' | 'mmd'): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/api/diagram/tabs/${id}/export?format=${format}`, {
      responseType: 'blob'
    });
  }

  exportProject(projectId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/api/diagram/projects/${projectId}/export`, {
      responseType: 'blob'
    });
  }

  // ==================== State Management ====================
  setActiveTab(tabId: string | null) {
    this.activeTabIdSubject.next(tabId);
  }

  getActiveTab(): string | null {
    return this.activeTabIdSubject.value;
  }

  clearState() {
    this.projectsSubject.next([]);
    this.tabsSubject.next([]);
    this.activeTabIdSubject.next(null);
  }
}