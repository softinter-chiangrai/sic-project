import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Burp01Service {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/burp01`;

  getItems(): Observable<any[]> {
    return of([]);
  }

  getItemById(id: string): Observable<any> {
    return of({ id });
  }

  saveItem(data: any): Observable<any> {
    return of(data);
  }

  deleteItem(id: string): Observable<void> {
    return of(void 0);
  }
}
