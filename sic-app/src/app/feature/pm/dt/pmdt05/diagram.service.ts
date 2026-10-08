// src/app/feature/pm/dt/pmdt06/diagram.service.ts
import { AiAttachmentPayload } from '../../../../core/utils/ai-attachment.util';
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, firstValueFrom, map, Observable, tap } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import type {
  AiModel,
  ChatMessage,
  DiagramModel,
  DiagramProject,
  DiagramType,
  DiagramVersion,
} from './diagram.model';
import { Pmrt02Service } from '../../rt/pmrt02/pmrt02.service';
import { LanguageService } from '../../../../core/services/language.service';

export interface PmChatResponse {
  id: string;
  diagramId: string;
  role: 'user' | 'assistant';
  content: string;
  contextData: any;
  createdBy: string;
  createdDate: string;
}

@Injectable({ providedIn: 'root' })
export class DiagramService {
  private http = inject(HttpClient);
  private languageService = inject(LanguageService);
  private apiUrl = environment.apiBaseUrl;

  private projectsSubject = new BehaviorSubject<DiagramProject[]>([]);
  private tabsSubject = new BehaviorSubject<DiagramModel[]>([]);
  private activeTabIdSubject = new BehaviorSubject<string | null>(null);
  private pmrt02Service = inject(Pmrt02Service);

  projects$ = this.projectsSubject.asObservable();
  tabs$ = this.tabsSubject.asObservable();
  activeTabId$ = this.activeTabIdSubject.asObservable();

  getProjectName(projectId: string): Observable<string> {
    return this.pmrt02Service.getProject(projectId).pipe(
      map(project => project.projectName)
    );
  }

  getProjects(): Observable<DiagramProject[]> {
    return this.http.get<any>(`${this.apiUrl}/api/pm/customer-projects?page=0&size=100`)
      .pipe(
        map(response => {
          const items = response?.content || response?.data || [];
          return items.map((p: any) => ({
            id: p.id,
            name: p.projectName,
            description: p.description,
            isFavorite: false,
            lastOpened: p.updatedDate || p.createdDate,
            createdAt: p.createdDate,
            updatedAt: p.updatedDate
          }));
        })
      );
  }

  createProject(name: string, description?: string): Observable<DiagramProject> {
    return this.http
      .post<DiagramProject>(`${this.apiUrl}/api/diagram/projects`, { name, description })
      .pipe(
        tap((project) => {
          const current = this.projectsSubject.value;
          this.projectsSubject.next([...current, project]);
        }),
      );
  }

  updateProject(id: string, data: Partial<DiagramProject>): Observable<DiagramProject> {
    return this.http.put<DiagramProject>(`${this.apiUrl}/api/diagram/projects/${id}`, data).pipe(
      tap((updated) => {
        const current = this.projectsSubject.value;
        this.projectsSubject.next(current.map((p) => (p.id === id ? updated : p)));
      }),
    );
  }

  deleteProject(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/api/diagram/projects/${id}`).pipe(
      tap(() => {
        const current = this.projectsSubject.value;
        this.projectsSubject.next(current.filter((p) => p.id !== id));
      }),
    );
  }

  // projectId is optional: the backend (`GET /api/diagram/tabs`) accepts an optional
  // `projectId` query param. When omitted, it returns all diagrams owned by the current
  // user across every project — used to show "everything" when no project is selected
  // via the navbar, matching the show-all-then-filter convention used elsewhere
  // (pmdt16/pmdt19/sic-gantt).
  getTabs(projectId?: string | null): Observable<DiagramModel[]> {
    const url = projectId
      ? `${this.apiUrl}/api/diagram/tabs?projectId=${projectId}`
      : `${this.apiUrl}/api/diagram/tabs`;
    return this.http
      .get<DiagramModel[]>(url)
      .pipe(tap((tabs) => this.tabsSubject.next(tabs)));
  }

  createTab(
    projectId: string,
    name: string,
    type: DiagramType,
    script?: string,
    requirementId?: string,
    diagramCode?: string,
    attachmentGroupId?: string
  ): Observable<DiagramModel> {
    const payload = {
      projectId,
      name,
      diagramType: type,
      mermaidScript: script || '',
      requirementId: requirementId || null,
      diagramCode: diagramCode?.trim() || null,
      attachmentGroupId: attachmentGroupId || null,
      metadata: {},
      sortOrder: this.tabsSubject.value.length + 1,
    };
    return this.http.post<DiagramModel>(`${this.apiUrl}/api/diagram/tabs`, payload).pipe(
      tap((tab) => {
        const current = this.tabsSubject.value;
        this.tabsSubject.next([...current, tab]);
      }),
    );
  }

  updateTab(tab: DiagramModel): Observable<DiagramModel> {
    return this.http.put<DiagramModel>(`${this.apiUrl}/api/diagram/tabs/${tab.id}`, tab).pipe(
      tap((updated) => {
        const current = this.tabsSubject.value;
        this.tabsSubject.next(current.map((t) => (t.id === updated.id ? updated : t)));
      }),
    );
  }

  deleteTab(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/api/diagram/tabs/${id}`).pipe(
      tap(() => {
        const current = this.tabsSubject.value;
        this.tabsSubject.next(current.filter((t) => t.id !== id));
      }),
    );
  }

  reorderTabs(tabs: { id: string; sortOrder: number }[]): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/api/diagram/tabs/reorder`, { tabs }).pipe(
      tap(() => {
        const current = this.tabsSubject.value;
        const updated = current.map((t) => {
          const order = tabs.find((o) => o.id === t.id);
          return order ? { ...t, sortOrder: order.sortOrder } : t;
        });
        this.tabsSubject.next(updated.sort((a, b) => a.sortOrder - b.sortOrder));
      }),
    );
  }

  duplicateTab(id: string): Observable<DiagramModel> {
    return this.http.post<DiagramModel>(`${this.apiUrl}/api/diagram/tabs/${id}/duplicate`, {});
  }

  getVersions(tabId: string): Observable<DiagramVersion[]> {
    return this.http.get<DiagramVersion[]>(`${this.apiUrl}/api/diagram/tabs/${tabId}/versions`);
  }

  restoreVersion(tabId: string, versionId: string): Observable<DiagramModel> {
    return this.http.post<DiagramModel>(
      `${this.apiUrl}/api/diagram/tabs/${tabId}/restore/${versionId}`,
      {},
    );
  }

  getAiModels(): Observable<AiModel[]> {
    return this.http.get<AiModel[]>(`${this.apiUrl}/api/ai/models`);
  }

  getChatSessions(tabId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/api/diagram/chat/${tabId}/sessions`);
  }

  getChatHistory(tabId: string, sessionId?: string): Observable<ChatMessage[]> {
    const url = sessionId
      ? `${this.apiUrl}/api/diagram/chat/${tabId}/history?sessionId=${sessionId}`
      : `${this.apiUrl}/api/diagram/chat/${tabId}/history`;
    return this.http.get<ChatMessage[]>(url);
  }

  sendChatMessage(
    tabId: string,
    message: string,
    sessionId?: string,
    sessionTitle?: string,
    model?: string,
    attachments: AiAttachmentPayload[] = []
  ): Observable<PmChatResponse> {
    return this.http.post<PmChatResponse>(
      `${this.apiUrl}/api/diagram/chat`,
      { diagramId: tabId, message, sessionId, sessionTitle, model, attachments }
    );
  }

  deleteChatSession(tabId: string, sessionId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/api/diagram/chat/${tabId}/sessions/${sessionId}`);
  }

  renameChatSession(tabId: string, sessionId: string, title: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/api/diagram/chat/${tabId}/sessions/${sessionId}/title`, { title });
  }

  clearChatHistory(tabId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/api/diagram/chat/${tabId}/history`);
  }

  generateDiagram(
    prompt: string,
    context?: any,
  ): Observable<{ script: string; type: DiagramType; name: string }> {
    return this.http.post<{ script: string; type: DiagramType; name: string }>(
      `${this.apiUrl}/api/diagram/ai/generate`,
      { prompt, context },
    );
  }

  improveDiagram(script: string, instruction: string): Observable<{ script: string }> {
    return this.http.post<{ script: string }>(`${this.apiUrl}/api/diagram/ai/improve`, {
      script,
      instruction,
    });
  }

  fixDiagram(script: string, errorMessage: string): Observable<{ script: string }> {
    return this.http.post<{ script: string }>(`${this.apiUrl}/api/diagram/ai/fix`, {
      script,
      errorMessage,
    });
  }

  convertDiagram(
    script: string,
    targetType: DiagramType,
  ): Observable<{ script: string; type: DiagramType }> {
    return this.http.post<{ script: string; type: DiagramType }>(
      `${this.apiUrl}/api/diagram/ai/convert`,
      { script, targetType },
    );
  }

  exportDiagram(id: string, format: 'png' | 'svg' | 'pdf' | 'md' | 'mmd'): Observable<Blob> {
    const lang = this.languageService.getCurrentLanguage();
    return this.http.get(`${this.apiUrl}/api/diagram/tabs/${id}/export?format=${format}`, {
      params: { lang },
      responseType: 'blob',
    });
  }

  exportPdf(id: string, image: string | null, pages?: { pageIndex: number; pageName: string; png: string }[]): Observable<Blob> {
    const lang = this.languageService.getCurrentLanguage();
    const body: any = { image };
    if (pages && pages.length > 0) {
      body.pages = pages;
    }
    return this.http.post(`${this.apiUrl}/api/diagram/tabs/${id}/export-pdf`, body, {
      params: { lang },
      responseType: 'blob',
    });
  }


  exportAllPdf(projectId: string, currentTabId?: string, image?: string | null): Observable<Blob> {
    const lang = this.languageService.getCurrentLanguage();
    return this.http.post(`${this.apiUrl}/api/diagram/tabs/export-all-pdf`, { currentTabId, image }, {
      params: { projectId, lang },
      responseType: 'blob',
    });
  }

  exportProject(projectId: string): Observable<Blob> {
    const lang = this.languageService.getCurrentLanguage();
    return this.http.get(`${this.apiUrl}/api/diagram/projects/${projectId}/export`, {
      params: { lang },
      responseType: 'blob',
    });
  }

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

  getDiagram(id: string): Observable<DiagramModel> {
    return this.http.get<DiagramModel>(`${this.apiUrl}/api/diagram/tabs/${id}`);
  }

  /**
   * สร้างรูป PNG ให้ diagram ของโครงการที่ยังไม่มีรูป (เช่น AI สร้างมาแต่ยังไม่เคยเปิดหน้า diagram) โดย render Mermaid ในเบราว์เซอร์
   * เพื่อให้รายงานโครงการมีรูปทันทีโดยไม่ต้องเข้าหน้า diagram ก่อน คืนจำนวนรูปที่สร้างได้
   */
  async ensureProjectImages(projectId: string): Promise<number> {
    const tabs = await firstValueFrom(this.getTabs(projectId));
    const missing = tabs.filter((t) => t.mermaidScript?.trim() && !t.graphData?.png?.trim());
    if (!missing.length) return 0;

    const { default: mermaid } = await import('mermaid');
    mermaid.initialize({ startOnLoad: false, securityLevel: 'strict', htmlLabels: false, flowchart: { htmlLabels: false } } as any);

    let done = 0;
    for (const tab of missing) {
      try {
        const png = await this.mermaidToPng(mermaid, tab.mermaidScript, tab.id);
        await firstValueFrom(
          this.updateTab({ ...tab, graphData: { ...(tab.graphData ?? {}), png }, state: 3, rowVersion: tab.rowVersion ?? null } as DiagramModel),
        );
        done++;
      } catch (e) {
        console.warn('[DiagramImage] skip', tab.name, e);
      }
    }
    return done;
  }

  private async mermaidToPng(mermaid: any, script: string, id: string): Promise<string> {
    const { svg } = await mermaid.render('dg' + id.replace(/-/g, ''), script);
    const el = new DOMParser().parseFromString(svg, 'image/svg+xml').documentElement;
    const vb = (el.getAttribute('viewBox') || '').split(/\s+/).map(Number);
    const w = vb[2] || parseFloat(el.getAttribute('width') || '') || 800;
    const h = vb[3] || parseFloat(el.getAttribute('height') || '') || 600;
    el.setAttribute('width', String(w));
    el.setAttribute('height', String(h));
    el.removeAttribute('style');

    const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(el)], { type: 'image/svg+xml;charset=utf-8' }));
    try {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const i = new Image();
        i.onload = () => resolve(i);
        i.onerror = reject;
        i.src = url;
      });
      const scale = Math.min(2, 4000 / Math.max(w, h));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(w * scale);
      canvas.height = Math.round(h * scale);
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.scale(scale, scale);
      ctx.drawImage(img, 0, 0, w, h);
      return canvas.toDataURL('image/png');
    } finally {
      URL.revokeObjectURL(url);
    }
  }
}