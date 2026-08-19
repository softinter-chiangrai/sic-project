// src/app/feature/pm/dt/pmdt05/pmdt05.service.ts
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pmdt04AModel } from './pmdt04A.model';
import { environment } from '../../../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class Pmdt05Service {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiBaseUrl}/api/pm/requirements/export`;

  exportRequirements(projectId: string, format: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}?projectId=${projectId}&format=${format}`, {
      responseType: 'blob',
    });
  }
}
