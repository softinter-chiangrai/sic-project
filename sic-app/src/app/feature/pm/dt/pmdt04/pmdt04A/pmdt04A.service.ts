// src/app/feature/pm/dt/pmdt05/pmdt05.service.ts
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pmdt04AModel } from './pmdt04A.model';
import { environment } from '../../../../../../environments/environment';
import { LanguageService } from '../../../../../core/services/language.service';

@Injectable({ providedIn: 'root' })
export class Pmdt04AService {
  private http = inject(HttpClient);
  private languageService = inject(LanguageService);
  private baseUrl = `${environment.apiBaseUrl}/api/pm/requirements/export`;

  exportRequirements(projectId: string, format: string): Observable<Blob> {
    const lang = this.languageService.getCurrentLanguage();
    return this.http.get(`${this.baseUrl}?projectId=${projectId}&format=${format}&lang=${lang}`, {
      responseType: 'blob',
    });
  }
}
