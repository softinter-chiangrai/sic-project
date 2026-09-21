import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { environment } from '../../../environments/environment';
import { DEFAULT_AI_MODEL } from '../config/ai-models.config';
import { AiAttachmentPayload } from '../utils/ai-attachment.util';
import {
  readLocalStorageList,
  readLocalStorageValue,
  writeLocalStorageList,
  writeLocalStorageValue,
} from '../utils/local-storage-list.util';

export interface AiRouteSuggestion {
  label: string;
  path: string;
}

export interface AiMessageAttachment {
  fileName: string;
  mimeType: string;
}

export interface AiNavigatorMessage {
  id?: string;
  role: 'user' | 'ai';
  text: string;
  routes?: AiRouteSuggestion[];
  attachments?: AiMessageAttachment[];
  timestamp?: string;
}

export interface AiChatSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  model: string;
  messages: AiNavigatorMessage[];
}

export interface AiNavigatorChatResponse {
  answer: string;
  suggestedRoutes: AiRouteSuggestion[] | null;
  openBatchModuleType: string | null;
  openBatchRoute: string | null;
}

const STORAGE_KEY_SESSIONS = 'sic_ai_navigator_sessions_v1';
const STORAGE_KEY_ACTIVE_ID = 'sic_ai_navigator_active_id_v1';
const STORAGE_KEY_SELECTED_MODEL = 'sic_ai_navigator_model_v1';

const INITIAL_WELCOME_TEXT =
  'สวัสดีครับ ผมคือผู้ช่วย AI นำทางระบบ SIC ถามขั้นตอนการใช้งาน หรือบอกว่าอยากไปหน้าไหน/อยากสร้างข้อมูลอะไรได้เลยครับ';
const NEW_SESSION_TITLE_FALLBACK = 'บทสนทนาใหม่';
const DEFAULT_SESSION_TITLE_FALLBACK = 'บทสนทนา';
const ATTACHMENT_TITLE_PREFIX_FALLBACK = 'แนบไฟล์: ';

function createDefaultSession(model: string, welcomeText: string, title: string): AiChatSession {
  const now = new Date().toISOString();
  return {
    id: 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    title,
    createdAt: now,
    updatedAt: now,
    model,
    messages: [
      {
        role: 'ai',
        text: welcomeText,
        timestamp: now,
      },
    ],
  };
}

@Injectable({ providedIn: 'root' })
export class AiNavigatorService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private translate = inject(TranslateService, { optional: true });
  private apiBase = environment.apiBaseUrl;

  readonly isOpen = signal(false);
  readonly isSending = signal(false);

  readonly sessions = signal<AiChatSession[]>(this.loadInitialSessions());
  readonly activeSessionId = signal<string>(this.loadInitialActiveId());

  readonly activeSession = computed<AiChatSession>(() => {
    const all = this.sessions();
    const currentId = this.activeSessionId();
    const found = all.find((s) => s.id === currentId);
    if (found) return found;
    if (all.length > 0) return all[0];
    return createDefaultSession(this.loadInitialModel(), this.getWelcomeText(), this.getNewSessionTitle());
  });

  readonly messages = computed<AiNavigatorMessage[]>(() => {
    return this.activeSession()?.messages ?? [];
  });

  /**
   * Derived from the active session's own `model` field instead of a separately-tracked
   * signal, so there is exactly one source of truth for "which model is this chat using" -
   * no risk of the two drifting out of sync across setModel()/selectSession()/createNewSession().
   */
  readonly selectedModel = computed<string>(() => this.activeSession()?.model || DEFAULT_AI_MODEL);

  constructor() {
    // Ensure at least one session exists
    if (this.sessions().length === 0) {
      const defaultSess = createDefaultSession(this.loadInitialModel(), this.getWelcomeText(), this.getNewSessionTitle());
      this.updateSessions(() => [defaultSess]);
      this.activeSessionId.set(defaultSess.id);
      this.persistActiveId(defaultSess.id);
    }
  }

  toggle(): void {
    this.isOpen.update((v) => !v);
  }

  open(): void {
    this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
  }

  setModel(modelId: string): void {
    // Persisted as the bootstrap default for the very first session a fresh browser ever gets;
    // every subsequent new session simply inherits whatever model the active session was using.
    writeLocalStorageValue(STORAGE_KEY_SELECTED_MODEL, modelId);

    const activeId = this.activeSession().id;
    this.updateActiveSession(activeId, (s) => ({ ...s, model: modelId }));
  }

  createNewSession(): void {
    const newSess = createDefaultSession(this.selectedModel(), this.getWelcomeText(), this.getNewSessionTitle());
    this.updateSessions((list) => [newSess, ...list]);
    this.activeSessionId.set(newSess.id);
    this.persistActiveId(newSess.id);
  }

  selectSession(sessionId: string): void {
    const exists = this.sessions().some((s) => s.id === sessionId);
    if (!exists) return;
    this.activeSessionId.set(sessionId);
    this.persistActiveId(sessionId);
  }

  deleteSession(sessionId: string): void {
    const prevSessions = this.sessions();
    const nextSessions = prevSessions.filter((s) => s.id !== sessionId);

    if (nextSessions.length === 0) {
      const fresh = createDefaultSession(this.loadInitialModel(), this.getWelcomeText(), this.getNewSessionTitle());
      this.updateSessions(() => [fresh]);
      this.activeSessionId.set(fresh.id);
      this.persistActiveId(fresh.id);
      return;
    }

    this.updateSessions(() => nextSessions);

    if (this.activeSessionId() === sessionId) {
      const fallbackId = nextSessions[0].id;
      this.activeSessionId.set(fallbackId);
      this.persistActiveId(fallbackId);
    }
  }

  clearAllHistory(): void {
    const fresh = createDefaultSession(this.loadInitialModel(), this.getWelcomeText(), this.getNewSessionTitle());
    this.updateSessions(() => [fresh]);
    this.activeSessionId.set(fresh.id);
    this.persistActiveId(fresh.id);
  }

  sendMessage(text: string, attachments?: AiAttachmentPayload[]): void {
    const trimmed = text.trim();
    const hasAttachments = !!(attachments && attachments.length > 0);
    if ((!trimmed && !hasAttachments) || this.isSending()) return;

    // activeSession() already falls back to the first session (or a fresh one) when
    // activeSessionId is stale/missing - resolve through it and self-heal the id signal so
    // updateActiveSession() below always finds a real session to append to.
    const currentActiveId = this.activeSession().id;
    if (currentActiveId !== this.activeSessionId()) {
      this.activeSessionId.set(currentActiveId);
      this.persistActiveId(currentActiveId);
      if (!this.sessions().some((s) => s.id === currentActiveId)) {
        this.updateSessions((list) => [...list, this.activeSession()]);
      }
    }
    const now = new Date().toISOString();

    const userMsgAttachments: AiMessageAttachment[] | undefined = hasAttachments
      ? attachments.map((a) => ({ fileName: a.fileName, mimeType: a.mimeType }))
      : undefined;

    const userMsg: AiNavigatorMessage = {
      role: 'user',
      text: trimmed,
      attachments: userMsgAttachments,
      timestamp: now,
    };

    this.updateActiveSession(currentActiveId, (s) => {
      // Auto update session title if it is still the default "new chat" title
      const isFirstUserMsg = !s.messages.some((m) => m.role === 'user');
      let nextTitle = s.title;
      if (isFirstUserMsg && (s.title === this.getNewSessionTitle() || !s.title)) {
        nextTitle = trimmed
          ? (trimmed.length > 30 ? trimmed.substring(0, 30) + '...' : trimmed)
          : (hasAttachments ? this.getAttachmentTitle(attachments![0].fileName) : this.getDefaultSessionTitle());
      }

      return {
        ...s,
        title: nextTitle,
        messages: [...s.messages, userMsg],
      };
    });

    this.isSending.set(true);

    const currentPath = this.router.url;
    const modelToUse = this.selectedModel() || DEFAULT_AI_MODEL;

    this.http
      .post<AiNavigatorChatResponse>(`${this.apiBase}/api/ai/navigator/chat`, {
        message: trimmed,
        currentPath,
        model: modelToUse,
        attachments: hasAttachments ? attachments : undefined,
      })
      .subscribe({
        next: (res) => {
          this.isSending.set(false);
          const aiMsg: AiNavigatorMessage = {
            role: 'ai',
            text: res.answer,
            routes: res.suggestedRoutes ?? [],
            timestamp: new Date().toISOString(),
          };

          this.updateActiveSession(currentActiveId, (s) => ({ ...s, messages: [...s.messages, aiMsg] }));

          if (res.openBatchRoute && res.openBatchModuleType) {
            this.navigateAndAutoOpen(res.openBatchRoute, res.openBatchModuleType, trimmed);
          }
        },
        error: () => {
          this.isSending.set(false);
          const errorText = this.translateOr('AI_NAV_ERROR_MSG', 'ขออภัยครับ เกิดข้อผิดพลาดในการเชื่อมต่อ AI กรุณาลองใหม่อีกครั้ง');
          const aiMsg: AiNavigatorMessage = {
            role: 'ai',
            text: errorText,
            timestamp: new Date().toISOString(),
          };
          this.updateActiveSession(currentActiveId, (s) => ({ ...s, messages: [...s.messages, aiMsg] }));
        },
      });
  }

  goTo(path: string): void {
    this.router.navigateByUrl(path);
    this.close();
  }

  /** Single write path for every session-list mutation: updates the signal and persists once. */
  private updateSessions(fn: (list: AiChatSession[]) => AiChatSession[]): AiChatSession[] {
    const next = fn(this.sessions());
    this.sessions.set(next);
    this.persistSessions(next);
    return next;
  }

  /** Patches one session by id (bumping updatedAt) through the shared updateSessions() write path. */
  private updateActiveSession(sessionId: string, patch: (session: AiChatSession) => AiChatSession): void {
    const now = new Date().toISOString();
    this.updateSessions((list) => list.map((s) => (s.id === sessionId ? { ...patch(s), updatedAt: now } : s)));
  }

  private navigateAndAutoOpen(route: string, moduleType: string, prompt: string): void {
    this.router.navigate([route], {
      queryParams: { aiAutoOpen: '1', aiModuleType: moduleType, aiPrompt: prompt },
    });
    this.close();
  }

  private getWelcomeText(): string {
    return this.translateOr('AI_NAV_INITIAL_WELCOME', INITIAL_WELCOME_TEXT);
  }

  private getNewSessionTitle(): string {
    return this.translateOr('AI_NAV_NEW_CHAT', NEW_SESSION_TITLE_FALLBACK);
  }

  private getDefaultSessionTitle(): string {
    return this.translateOr('AI_NAV_DEFAULT_SESSION_TITLE', DEFAULT_SESSION_TITLE_FALLBACK);
  }

  private getAttachmentTitle(fileName: string): string {
    const prefix = this.translateOr('AI_NAV_ATTACHMENT_TITLE_PREFIX', ATTACHMENT_TITLE_PREFIX_FALLBACK);
    return prefix + fileName;
  }

  /**
   * TranslateService.instant() returns the key itself (a truthy string) when the
   * translation hasn't loaded yet or the key is missing - a plain `|| fallback` never
   * catches that case. This checks for it explicitly.
   */
  private translateOr(key: string, fallback: string): string {
    const value = this.translate?.instant(key);
    return value && value !== key ? value : fallback;
  }

  private loadInitialModel(): string {
    return readLocalStorageValue(STORAGE_KEY_SELECTED_MODEL, DEFAULT_AI_MODEL) || DEFAULT_AI_MODEL;
  }

  private loadInitialSessions(): AiChatSession[] {
    return readLocalStorageList<AiChatSession>(STORAGE_KEY_SESSIONS);
  }

  private loadInitialActiveId(): string {
    return readLocalStorageValue(STORAGE_KEY_ACTIVE_ID);
  }

  private persistSessions(sessions: AiChatSession[]): void {
    writeLocalStorageList(STORAGE_KEY_SESSIONS, sessions);
  }

  private persistActiveId(id: string): void {
    writeLocalStorageValue(STORAGE_KEY_ACTIVE_ID, id);
  }
}
