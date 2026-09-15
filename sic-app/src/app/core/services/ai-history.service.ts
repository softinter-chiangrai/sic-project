// src/app/core/services/ai-history.service.ts
import { Injectable } from '@angular/core';
import { DEFAULT_AI_MODEL } from '../config/ai-models.config';

export interface AiHistoryItem<T = any> {
  id: string;
  versionNo: number;
  moduleKey: string;
  targetId?: string;
  title?: string;
  model?: string;
  prompt?: string;
  summary?: string;
  createdAt: string;
  data: T;
}

@Injectable({
  providedIn: 'root',
})
export class AiHistoryService {
  private readonly PREFIX = 'sic_ai_history_';

  private getStorageKey(moduleKey: string, targetId?: string | null): string {
    const safeTarget = targetId && targetId !== 'undefined' && targetId !== 'null' ? targetId : 'default';
    return `${this.PREFIX}${moduleKey}_${safeTarget}`;
  }

  getHistories<T = any>(moduleKey: string, targetId?: string | null): AiHistoryItem<T>[] {
    try {
      const key = this.getStorageKey(moduleKey, targetId);
      const raw = localStorage.getItem(key);
      if (!raw) return [];
      const items: AiHistoryItem<T>[] = JSON.parse(raw);
      return Array.isArray(items) ? items : [];
    } catch (e) {
      console.error('Failed to load AI history from localStorage:', e);
      return [];
    }
  }

  addHistory<T = any>(
    moduleKey: string,
    targetId: string | null | undefined,
    data: T,
    prompt?: string,
    model?: string,
    title?: string,
    summary?: string
  ): AiHistoryItem<T> {
    const existing = this.getHistories<T>(moduleKey, targetId);
    const nextVersionNo = existing.length > 0 ? (Math.max(...existing.map((x) => x.versionNo || 1)) + 1) : 1;

    const newItem: AiHistoryItem<T> = {
      id: `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      versionNo: nextVersionNo,
      moduleKey,
      targetId: targetId || undefined,
      title: title || `Version ${nextVersionNo}`,
      model: model || DEFAULT_AI_MODEL,
      prompt: prompt || '',
      summary: summary || '',
      createdAt: new Date().toISOString(),
      data,
    };

    const updated = [newItem, ...existing];
    try {
      const key = this.getStorageKey(moduleKey, targetId);
      localStorage.setItem(key, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save AI history to localStorage:', e);
    }

    return newItem;
  }

  deleteHistory(moduleKey: string, targetId: string | null | undefined, historyId: string): void {
    const existing = this.getHistories(moduleKey, targetId);
    const filtered = existing.filter((item) => item.id !== historyId);
    try {
      const key = this.getStorageKey(moduleKey, targetId);
      localStorage.setItem(key, JSON.stringify(filtered));
    } catch (e) {
      console.error('Failed to delete AI history item:', e);
    }
  }

  clearHistories(moduleKey: string, targetId?: string | null): void {
    try {
      const key = this.getStorageKey(moduleKey, targetId);
      localStorage.removeItem(key);
    } catch (e) {
      console.error('Failed to clear AI history:', e);
    }
  }
}
