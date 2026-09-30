import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { catchError, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AI_MODEL_OPTIONS,
  AiModelOption,
  DEFAULT_AI_MODEL,
  STORAGE_KEY_CACHED_MODELS,
  STORAGE_KEY_DEFAULT_MODEL,
} from '../config/ai-models.config';

@Injectable({ providedIn: 'root' })
export class AiModelsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiBaseUrl}/api/ai/models`;

  readonly models = signal<AiModelOption[]>(AI_MODEL_OPTIONS);
  readonly defaultModel = signal<string>(DEFAULT_AI_MODEL);

  constructor() {
    this.refresh();
  }

  refresh(): void {
    this.http.get<AiModelOption[]>(this.apiUrl).pipe(
      tap((remoteModels) => {
        if (remoteModels && remoteModels.length > 0) {
          AI_MODEL_OPTIONS.length = 0;
          AI_MODEL_OPTIONS.push(...remoteModels);

          this.models.set([...remoteModels]);
          const rec = remoteModels.find((m) => m.recommended);
          const defId = rec ? rec.id : remoteModels[0].id;
          this.defaultModel.set(defId);

          try {
            if (typeof localStorage !== 'undefined') {
              localStorage.setItem(STORAGE_KEY_CACHED_MODELS, JSON.stringify(remoteModels));
              localStorage.setItem(STORAGE_KEY_DEFAULT_MODEL, defId);
            }
          } catch {
            // ignore
          }
        }
      }),
      catchError(() => of(AI_MODEL_OPTIONS)),
    ).subscribe();
  }
}
