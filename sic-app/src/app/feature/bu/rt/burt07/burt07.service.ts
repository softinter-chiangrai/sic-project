// src/app/feature/bu/rt/burt07/burt07.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { AiModelConfig } from './burt07.model';

@Injectable({ providedIn: 'root' })
export class Burt07Service {
  private http = inject(HttpClient);
  private baseUrl = environment.apiBaseUrl + '/api/ai-model-config';

  getModels(): Observable<AiModelConfig[]> {
    return this.http.get<AiModelConfig[]>(this.baseUrl);
  }

  getModel(id: string): Observable<AiModelConfig> {
    return this.http.get<AiModelConfig>(`${this.baseUrl}/${id}`);
  }

  saveModel(data: Partial<AiModelConfig>): Observable<AiModelConfig> {
    return this.http.post<AiModelConfig>(this.baseUrl, data);
  }

  deleteModel(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
