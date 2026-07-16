import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

export interface MermaidResponse {
  mermaid: string;
}

export interface DiagramSaveRequest {
  tabId: string;
  xml: string;
  name?: string;
}

export interface DiagramResponse {
  xml: string;
}

@Injectable({
  providedIn: 'root'
})
export class AiDiagramService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiBaseUrl;

  generateMermaid(prompt: string): Observable<MermaidResponse> {
    return this.http.post<MermaidResponse>(`${this.apiUrl}/api/ai/generate-mermaid`, { prompt });
  }

  saveDiagram(tabId: string, xml: string, name?: string): Observable<any> {
    const payload = {
      graphData: { xml }
    };
    return this.http.put(`${this.apiUrl}/api/diagram/tabs/${tabId}`, payload);
  }

  loadDiagram(tabId: string): Observable<DiagramResponse> {
    return new Observable<DiagramResponse>((observer) => {
      this.http.get<any>(`${this.apiUrl}/api/diagram/tabs/${tabId}`).subscribe({
        next: (res) => {
          const xml = res?.graphData?.xml || '';
          observer.next({ xml });
          observer.complete();
        },
        error: (err) => {
          observer.error(err);
        }
      });
    });
  }
}