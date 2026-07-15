import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/auth/auth.service';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface ChatMessage {
  role: string;
  content: string;
}

export interface ChatRequest {
  question: string;
  history?: ChatMessage[];
  folder_id?: string;
  category_id?: string;
  tag_ids?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class DogBuddyService {
  // Use the sic-api proxy endpoint
  private apiUrl = `${environment.apiBaseUrl}/api/buddy/chat`;

  constructor(private http: HttpClient, private authService: AuthService) { }

  chat(request: ChatRequest): Observable<string> {
    // Note: To handle server-sent events (SSE) cleanly with HttpClient in Angular,
    // we use responseType: 'text' and observe: 'events', or we can just fetch via native fetch API
    // for easier stream reading since Angular's HttpClient doesn't natively return a ReadableStream easily.
    
    // For simplicity, returning the observable. If streaming is required, native fetch is often better.
    return new Observable<string>(observer => {
      fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Assuming the user is authenticated in sic-app and sic-api expects their JWT
          'Authorization': `Bearer ${this.authService.getAccessToken() || ''}`
        },
        body: JSON.stringify(request)
      }).then(async response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const reader = response.body?.getReader();
        const decoder = new TextDecoder('utf-8');
        
        if (!reader) {
          observer.error(new Error('Response body is null'));
          return;
        }

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const text = decoder.decode(value, { stream: true });
          observer.next(text);
        }
        
        observer.complete();
      }).catch(err => {
        observer.error(err);
      });
    });
  }
}
