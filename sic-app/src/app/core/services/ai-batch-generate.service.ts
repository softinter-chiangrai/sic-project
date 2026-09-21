import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AiAttachmentPayload } from '../utils/ai-attachment.util';

export interface AiBatchGenerateResponse {
  moduleType: string;
  items: Record<string, any>[];
  message: string | null;
}

@Injectable({ providedIn: 'root' })
export class AiBatchGenerateService {
  private http = inject(HttpClient);
  private apiBase = environment.apiBaseUrl;

  generate(params: {
    moduleType: string;
    prompt: string;
    count?: number;
    projectId?: string | null;
    model?: string;
    attachments?: AiAttachmentPayload[];
  }): Observable<Record<string, any>[]> {
    return this.http
      .post<AiBatchGenerateResponse>(`${this.apiBase}/api/ai/batch-generate`, params)
      .pipe(map((res) => res.items ?? []));
  }
}
