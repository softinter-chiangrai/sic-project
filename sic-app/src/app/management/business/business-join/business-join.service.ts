import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BusinessJoinService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiBaseUrl + '/api/business';

  join(token: string): Observable<void> {
    return this.http.post<void>(`${this.base}/join`, { token });
  }

  getMyBusinesses(): Observable<{ id: string; name: string; code: string }[]> {
    return this.http.get<{ id: string; name: string; code: string }[]>(`${this.base}/my-business`);
  }
}
