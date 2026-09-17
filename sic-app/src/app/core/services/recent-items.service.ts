// src/app/core/services/recent-items.service.ts
import { Injectable, signal } from '@angular/core';

export interface RecentItem {
  id: string;
  label: string;
  type: string;
  path: string;
  queryParams?: Record<string, string>;
  icon: string;
  accessedAt: string;
}

const STORAGE_KEY = 'recentItems';
const MAX_ITEMS = 8;

@Injectable({ providedIn: 'root' })
export class RecentItemsService {
  readonly items = signal<RecentItem[]>(this.loadFromStorage());

  record(item: Omit<RecentItem, 'accessedAt'>): void {
    const next: RecentItem = { ...item, accessedAt: new Date().toISOString() };
    const filtered = this.items().filter((i) => !(i.type === next.type && i.id === next.id));
    const updated = [next, ...filtered].slice(0, MAX_ITEMS);
    this.items.set(updated);
    this.saveToStorage(updated);
  }

  clear(): void {
    this.items.set([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch { /* ignore */ }
  }

  private loadFromStorage(): RecentItem[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private saveToStorage(items: RecentItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch { /* ignore */ }
  }
}
