import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { DEFAULT_AI_MODEL } from '../config/ai-models.config';

export interface AiRouteSuggestion {
  label: string;
  path: string;
}

export interface AiNavigatorMessage {
  role: 'user' | 'ai';
  text: string;
  routes?: AiRouteSuggestion[];
}

export interface AiNavigatorChatResponse {
  answer: string;
  suggestedRoutes: AiRouteSuggestion[] | null;
  openBatchModuleType: string | null;
  openBatchRoute: string | null;
}

@Injectable({ providedIn: 'root' })
export class AiNavigatorService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiBase = environment.apiBaseUrl;

  readonly isOpen = signal(false);
  readonly isSending = signal(false);
  readonly messages = signal<AiNavigatorMessage[]>([
    {
      role: 'ai',
      text: 'สวัสดีครับ ผมคือผู้ช่วย AI นำทางระบบ SIC ถามขั้นตอนการใช้งาน หรือบอกว่าอยากไปหน้าไหน/อยากสร้างข้อมูลอะไรได้เลยครับ',
    },
  ]);

  toggle(): void {
    this.isOpen.update((v) => !v);
  }

  open(): void {
    this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
  }

  sendMessage(text: string): void {
    const trimmed = text.trim();
    if (!trimmed || this.isSending()) return;

    this.messages.update((m) => [...m, { role: 'user', text: trimmed }]);
    this.isSending.set(true);

    const currentPath = this.router.url;

    this.http
      .post<AiNavigatorChatResponse>(`${this.apiBase}/api/ai/navigator/chat`, {
        message: trimmed,
        currentPath,
        model: DEFAULT_AI_MODEL,
      })
      .subscribe({
        next: (res) => {
          this.isSending.set(false);
          this.messages.update((m) => [
            ...m,
            { role: 'ai', text: res.answer, routes: res.suggestedRoutes ?? [] },
          ]);

          if (res.openBatchRoute && res.openBatchModuleType) {
            this.navigateAndAutoOpen(res.openBatchRoute, res.openBatchModuleType, trimmed);
          }
        },
        error: () => {
          this.isSending.set(false);
          this.messages.update((m) => [
            ...m,
            { role: 'ai', text: 'ขออภัยครับ เกิดข้อผิดพลาดในการเชื่อมต่อ AI กรุณาลองใหม่อีกครั้ง' },
          ]);
        },
      });
  }

  goTo(path: string): void {
    this.router.navigateByUrl(path);
    this.close();
  }

  /**
   * นำทางไปหน้าโมดูลที่ต้องการ พร้อมส่ง query param บอกให้หน้านั้นเปิด AI Modal/Batch Create
   * ทันทีและใช้ prompt เดิมที่ผู้ใช้พิมพ์ไว้ - แต่ละหน้าที่รองรับจะอ่าน query param เหล่านี้เอง:
   *   aiAutoOpen=1, aiModuleType=<CODE>, aiPrompt=<encoded text>
   */
  private navigateAndAutoOpen(route: string, moduleType: string, prompt: string): void {
    this.router.navigate([route], {
      queryParams: { aiAutoOpen: '1', aiModuleType: moduleType, aiPrompt: prompt },
    });
    this.close();
  }
}
