// src/app/feature/pm/rt/pmrt03/pmrt03.service.ts
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pmrt03Model } from './pmrt03.model';
import { environment } from '../../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class Pmrt03Service {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiBaseUrl}/api/pm/dashboard`;

  getDashboard(projectId: string): Observable<Pmrt03Model> {
    return this.http.get<Pmrt03Model>(`${this.baseUrl}/${projectId}`);
  }
}
