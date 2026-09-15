// src/app/feature/pm/dt/pmdt05/pmdt05A/pmdt05A.component.ts

import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnInit,
  OnDestroy,
  inject,
  signal,
  computed,
  viewChild,
  ChangeDetectionStrategy
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MarkdownModule } from 'ngx-markdown';
import { Subject, forkJoin, of, takeUntil } from 'rxjs';
import { catchError } from 'rxjs/operators';
import type { AiModel, ChatMessage, DiagramChatSession } from '../diagram.model';
import { DiagramService, PmChatResponse } from '../diagram.service';
import { DialogService } from '../../../../../core/services/dialog.service';
import { SicComboboxComponent } from '../../../../../core/component/sic-combobox/sic-combobox.component';
import { AI_MODEL_OPTIONS, DEFAULT_AI_MODEL } from '../../../../../core/config/ai-models.config';

@Component({
  selector: 'app-pmdt05a',
  standalone: true,
  imports: [CommonModule, FormsModule, MarkdownModule, SicComboboxComponent],
  templateUrl: './pmdt05A.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./pmdt05A.component.css'],
})
export class Pmdt05AComponent implements OnInit, AfterViewInit, OnDestroy {
  private _diagramId: string | null = null;
  @Input()
  set diagramId(value: string | null) {
    if (value && value !== this._diagramId) {
      this._diagramId = value;
      this.loadChatSessions(value);
    } else if (!value) {
      this._diagramId = null;
      this.sessions.set([]);
      this.activeSessionId.set(null);
    }
  }
  get diagramId(): string | null {
    return this._diagramId;
  }

  private diagramService = inject(DiagramService);
  private dialogService = inject(DialogService);
  private destroy$ = new Subject<void>();

  // AI Models state
  availableModels = signal<AiModel[]>([]);
  selectedModelId = signal<string>(DEFAULT_AI_MODEL);
  showModelMenu = signal<boolean>(false);

  selectedModel = computed(() => {
    const list = this.availableModels();
    const id = this.selectedModelId();
    return list.find((m) => m.id === id) || (list.length > 0 ? list[0] : null);
  });

  // Sessions state
  sessions = signal<DiagramChatSession[]>([]);
  activeSessionId = signal<string | null>(null);
  isHistoryView = signal<boolean>(false);
  searchQuery = signal<string>('');

  // Editing session title
  editingSessionId = signal<string | null>(null);
  editingTitle = signal<string>('');

  // Active session and messages
  activeSession = computed(() => {
    const list = this.sessions();
    const id = this.activeSessionId();
    if (!id) return list.length > 0 ? list[0] : null;
    return list.find((s) => s.id === id) || (list.length > 0 ? list[0] : null);
  });

  messages = computed(() => {
    return this.activeSession()?.messages || [];
  });

  // Filtered sessions for history view
  filteredSessions = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    const list = this.sessions();
    if (!q) return list;
    return list.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.messages.some((m) => m.content.toLowerCase().includes(q))
    );
  });

  userInput = '';
  isLoading = signal(false);
  copiedStatus = signal<Record<string, boolean>>({});

  chatContainer = viewChild<ElementRef>('chatContainer');

  // Suggested prompt pills
  promptSuggestions = [
    { title: 'สร้าง ER Diagram', prompt: 'ช่วยออกแบบ ER Diagram สำหรับระบบนี้แบบละเอียด พร้อม Entity และ Relationship' },
    { title: 'สร้าง Flowchart', prompt: 'ช่วยสร้าง Flowchart แสดงขั้นตอนการทำงานหลักของระบบ' },
    { title: 'สร้าง Sequence Diagram', prompt: 'ช่วยสร้าง Sequence Diagram แสดง Flow การทำงานและการเชื่อมต่อระหว่าง Component' },
    { title: 'วิเคราะห์และปรับปรุง', prompt: 'ช่วยวิเคราะห์ Diagram นี้และแนะนำจุดที่ควรปรับปรุงหรือเพิ่มเติม' },
  ];

  ngOnInit() {
    this.loadAiModels();
  }

  ngAfterViewInit() {
    // Nothing extra needed
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAiModels() {
    // Restore saved model if any
    try {
      const saved = localStorage.getItem('pm_selected_ai_model');
      if (saved) {
        this.selectedModelId.set(saved);
      }
    } catch (e) {
      console.warn('Failed to read saved AI model', e);
    }

    this.diagramService
      .getAiModels()
      .pipe(
        takeUntil(this.destroy$),
        catchError(() =>
          of(AI_MODEL_OPTIONS.map(m => ({
            id: m.id,
            name: m.name,
            provider: m.provider || 'AI',
            description: m.name,
            icon: 'bi-stars',
            recommended: m.recommended ?? false
          })) as AiModel[])
        )
      )
      .subscribe((models) => {
        this.availableModels.set(models);
        if (!models.some((m) => m.id === this.selectedModelId())) {
          this.selectedModelId.set(models[0]?.id || DEFAULT_AI_MODEL);
        }
      });
  }

  selectModel(modelId: string, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.selectedModelId.set(modelId);
    this.showModelMenu.set(false);
    try {
      localStorage.setItem('pm_selected_ai_model', modelId);
    } catch (e) {
      console.warn('Failed to save selected AI model', e);
    }
  }

  toggleModelMenu(event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.showModelMenu.update((v) => !v);
  }

  private getStorageKey(diagramId: string): string {
    return `pm_diagram_chat_sessions_${diagramId}`;
  }

  loadChatSessions(diagramId: string) {
    if (!diagramId) return;

    // Load from backend first
    this.diagramService
      .getChatSessions(diagramId)
      .pipe(
        takeUntil(this.destroy$),
        catchError(() => of([]))
      )
      .subscribe((backendSessions: any[]) => {
        if (backendSessions && backendSessions.length > 0) {
          // Fetch messages for each session from backend
          const observables = backendSessions.map((bs) =>
            this.diagramService.getChatHistory(diagramId, bs.sessionId).pipe(
              catchError(() => of([]))
            )
          );

          forkJoin(observables)
            .pipe(takeUntil(this.destroy$))
            .subscribe((results) => {
              const fullSessions: DiagramChatSession[] = backendSessions.map((bs, index) => ({
                id: bs.sessionId,
                diagramId: diagramId,
                title: bs.title || 'บทสนทนา',
                createdAt: bs.createdAt,
                updatedAt: bs.updatedAt,
                messages: results[index] || [],
              }));

              this.sessions.set(fullSessions);
              this.activeSessionId.set(fullSessions[0].id);
              this.saveSessionsToStorage(diagramId, fullSessions);
              this.scrollToBottom();
            });
        } else {
          // Fallback to localStorage or create a fresh new session
          this.loadFromStorageOrCreate(diagramId);
        }
      });
  }

  private loadFromStorageOrCreate(diagramId: string) {
    try {
      const stored = localStorage.getItem(this.getStorageKey(diagramId));
      if (stored) {
        const parsed: DiagramChatSession[] = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.sessions.set(parsed);
          this.activeSessionId.set(parsed[0].id);
          this.scrollToBottom();
          return;
        }
      }
    } catch (e) {
      console.warn('Failed to parse chat sessions from storage', e);
    }

    this.createNewSession(false);
  }

  private saveSessionsToStorage(diagramId: string, sessions: DiagramChatSession[]) {
    try {
      localStorage.setItem(this.getStorageKey(diagramId), JSON.stringify(sessions));
    } catch (e) {
      console.warn('Failed to save chat sessions to storage', e);
    }
  }

  createNewSession(switchToChat = true) {
    if (!this.diagramId) return;

    const newSession: DiagramChatSession = {
      id: crypto.randomUUID(),
      diagramId: this.diagramId,
      title: 'บทสนทนาใหม่',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [],
    };

    this.sessions.update((list) => [newSession, ...list]);
    this.activeSessionId.set(newSession.id);
    this.saveSessionsToStorage(this.diagramId, this.sessions());

    if (switchToChat) {
      this.isHistoryView.set(false);
    }
  }

  selectSession(sessionId: string) {
    this.activeSessionId.set(sessionId);
    this.isHistoryView.set(false);
    this.scrollToBottom();
  }

  openHistory() {
    this.searchQuery.set('');
    this.isHistoryView.set(true);
  }

  closeHistory() {
    this.isHistoryView.set(false);
    this.scrollToBottom();
  }

  startRenameSession(session: DiagramChatSession, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.editingSessionId.set(session.id);
    this.editingTitle.set(session.title);
  }

  saveRenameSession(event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    const id = this.editingSessionId();
    const newTitle = this.editingTitle().trim();
    if (id && newTitle && this.diagramId) {
      this.sessions.update((list) =>
        list.map((s) => (s.id === id ? { ...s, title: newTitle, updatedAt: new Date().toISOString() } : s))
      );
      this.saveSessionsToStorage(this.diagramId, this.sessions());

      // Sync with backend
      this.diagramService.renameChatSession(this.diagramId, id, newTitle)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          error: (err) => console.warn('Failed to rename session on backend', err)
        });
    }
    this.editingSessionId.set(null);
    this.editingTitle.set('');
  }

  cancelRenameSession(event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.editingSessionId.set(null);
    this.editingTitle.set('');
  }

  deleteSession(sessionId: string, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    if (!this.diagramId) return;

    // Call backend delete
    this.diagramService.deleteChatSession(this.diagramId, sessionId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        error: (err) => console.warn('Failed to delete session on backend', err)
      });

    const remaining = this.sessions().filter((s) => s.id !== sessionId);
    if (remaining.length === 0) {
      const freshSession: DiagramChatSession = {
        id: crypto.randomUUID(),
        diagramId: this.diagramId,
        title: 'บทสนทนาใหม่',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: [],
      };
      this.sessions.set([freshSession]);
      this.activeSessionId.set(freshSession.id);
      this.saveSessionsToStorage(this.diagramId, [freshSession]);
    } else {
      this.sessions.set(remaining);
      if (this.activeSessionId() === sessionId) {
        this.activeSessionId.set(remaining[0].id);
      }
      this.saveSessionsToStorage(this.diagramId, remaining);
    }
  }

  applyPrompt(promptText: string) {
    this.userInput = promptText;
    this.sendMessage();
  }

  sendMessage() {
    if (!this.userInput.trim() || this.isLoading() || !this.diagramId) return;

    let currentSession = this.activeSession();
    if (!currentSession) {
      this.createNewSession(true);
      currentSession = this.activeSession()!;
    }

    const input = this.userInput.trim();
    const isFirstMessage = currentSession.messages.length === 0;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      diagramId: this.diagramId,
      userId: 'current-user',
      role: 'user',
      content: input,
      createdAt: new Date().toISOString(),
    };

    // Auto-update title if it's new
    let sessionTitle = currentSession.title;
    if (isFirstMessage || sessionTitle === 'บทสนทนาใหม่') {
      sessionTitle = input.slice(0, 35).trim() + (input.length > 35 ? '...' : '');
    }

    const updatedSession: DiagramChatSession = {
      ...currentSession,
      title: sessionTitle,
      updatedAt: new Date().toISOString(),
      messages: [...currentSession.messages, userMessage],
    };

    this.sessions.update((list) =>
      list.map((s) => (s.id === updatedSession.id ? updatedSession : s))
    );
    this.saveSessionsToStorage(this.diagramId, this.sessions());

    const activeModel = this.selectedModelId();
    this.userInput = '';
    this.isLoading.set(true);
    this.scrollToBottom();

    // Call Backend API with sessionId, sessionTitle and model
    this.diagramService
      .sendChatMessage(this.diagramId, input, updatedSession.id, sessionTitle, activeModel)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: PmChatResponse) => {
          const assistantMsg: ChatMessage = {
            id: response.id || crypto.randomUUID(),
            diagramId: response.diagramId || this.diagramId!,
            userId: response.createdBy || 'system',
            role: response.role || 'assistant',
            content: response.content,
            contextData: response.contextData,
            createdAt: response.createdDate || new Date().toISOString(),
          };

          const active = this.activeSession();
          if (active && active.id === updatedSession.id) {
            const finalSession: DiagramChatSession = {
              ...active,
              updatedAt: new Date().toISOString(),
              messages: [...active.messages, assistantMsg],
            };
            this.sessions.update((list) =>
              list.map((s) => (s.id === finalSession.id ? finalSession : s))
            );
            this.saveSessionsToStorage(this.diagramId!, this.sessions());
          }

          this.isLoading.set(false);
          this.scrollToBottom();
        },
        error: (err) => {
          console.error('Chat error:', err);
          this.isLoading.set(false);
          const errorMsg: ChatMessage = {
            id: crypto.randomUUID(),
            diagramId: this.diagramId!,
            userId: 'system',
            role: 'assistant',
            content: '❌ เกิดข้อผิดพลาดในการเชื่อมต่อกับ AI กรุณาลองใหม่อีกครั้ง',
            createdAt: new Date().toISOString(),
          };

          const active = this.activeSession();
          if (active) {
            const finalSession: DiagramChatSession = {
              ...active,
              messages: [...active.messages, errorMsg],
            };
            this.sessions.update((list) =>
              list.map((s) => (s.id === finalSession.id ? finalSession : s))
            );
            this.saveSessionsToStorage(this.diagramId!, this.sessions());
          }
          this.scrollToBottom();
        },
      });
  }

  // ฟังก์ชันดึง Mermaid code จากข้อความ
  getMermaidCode(content: string): string | null {
    const match = content.match(/```mermaid\s*([\s\S]*?)```/);
    return match ? match[1].trim() : null;
  }

  // ฟังก์ชันคัดลอก Mermaid code
  copyMermaidCode(content: string, messageId: string): void {
    const code = this.getMermaidCode(content);
    if (!code) return;

    const markAsCopied = () => {
      this.copiedStatus.update((status) => ({ ...status, [messageId]: true }));
      setTimeout(() => {
        this.copiedStatus.update((status) => ({ ...status, [messageId]: false }));
      }, 2000);
    };

    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(code)
        .then(() => markAsCopied())
        .catch(() => this.fallbackCopy(code, markAsCopied));
    } else {
      this.fallbackCopy(code, markAsCopied);
    }
  }

  private fallbackCopy(text: string, onSuccess?: () => void): void {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      if (onSuccess) onSuccess();
    } catch (e) {
      console.warn('Copy failed', e);
    }
    textarea.remove();
  }

  clearCurrentChat() {
    const active = this.activeSession();
    if (!active || !this.diagramId) return;

    this.deleteSession(active.id);
  }

  private scrollToBottom() {
    setTimeout(() => {
      const container = this.chatContainer()?.nativeElement;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }, 50);
  }
}