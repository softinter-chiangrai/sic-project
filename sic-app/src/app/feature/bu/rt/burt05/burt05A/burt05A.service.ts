// src/app/feature/bu/rt/burt05/burt05A/burt05A.service.ts
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Burt05AModel } from './burt05A.model';
import { environment } from '../../../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class Burt05AService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiBaseUrl}/api/su/programs`;

  getProgram(id: string): Observable<Burt05AModel> {
    return this.http.get<Burt05AModel>(`${this.baseUrl}/${id}`);
  }

  saveProgram(program: Partial<Burt05AModel>): Observable<{ id: string }> {
    return this.http.post<{ id: string }>(`${this.baseUrl}/save`, program);
  }
}
