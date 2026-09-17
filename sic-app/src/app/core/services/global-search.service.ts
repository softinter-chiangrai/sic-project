// src/app/core/services/global-search.service.ts
import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { debounceTime, distinctUntilChanged, Subject, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SicSidebarService } from '../component/sic-sidebar/sic-sidebar.service';
import { MenuItemModel } from '../component/sic-sidebar/sic-sidebar.model';

export interface CustomerHit {
  id: string;
  name: string;
  customerCode: string;
}

export interface ProjectHit {
  id: string;
  projectName: string;
  projectCode: string;
  customerId: string;
  customerName: string;
}

export interface ContractHit {
  id: string;
  contractNo: string;
  contractType: string;
  customerId: string;
  customerName: string;
  projectId: string;
}

export interface MenuHit {
  code: string;
  label: string;
  icon?: string;
  path: string;
}

export interface GlobalSearchResult {
  customers: CustomerHit[];
  projects: ProjectHit[];
  contracts: ContractHit[];
  menus: MenuHit[];
}

const EMPTY_RESULT: GlobalSearchResult = { customers: [], projects: [], contracts: [], menus: [] };
const RECENT_KEY = 'globalSearchRecent';
const RECENT_MAX = 8;

@Injectable({ providedIn: 'root' })
export class GlobalSearchService {
  private readonly http = inject(HttpClient);
  private readonly sidebarService = inject(SicSidebarService);
  private readonly apiUrl = environment.apiBaseUrl + '/api/search/global';

  readonly isOpen = signal(false);
  readonly isLoading = signal(false);
  readonly results = signal<GlobalSearchResult>(EMPTY_RESULT);
  readonly recentSearches = signal<string[]>(this.loadRecent());

  private flatMenuItems: MenuHit[] | null = null;
  private readonly query$ = new Subject<string>();

  constructor() {
    this.query$
      .pipe(
        debounceTime(250),
        distinctUntilChanged(),
        switchMap((keyword) => {
          if (!keyword.trim()) {
            this.isLoading.set(false);
            return [];
          }
          this.isLoading.set(true);
          return this.http.get<Omit<GlobalSearchResult, 'menus'>>(this.apiUrl, {
            params: { q: keyword, limit: '8' },
          });
        }),
      )
      .subscribe({
        next: (res) => {
          const keyword = res ? this.lastKeyword : '';
          this.results.set({
            customers: res?.customers ?? [],
            projects: res?.projects ?? [],
            contracts: res?.contracts ?? [],
            menus: keyword ? this.searchMenus(keyword) : [],
          });
          this.isLoading.set(false);
        },
        error: () => {
          this.results.set(EMPTY_RESULT);
          this.isLoading.set(false);
        },
      });
  }

  private lastKeyword = '';

  open(): void {
    this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
    this.results.set(EMPTY_RESULT);
  }

  toggle(): void {
    this.isOpen() ? this.close() : this.open();
  }

  search(keyword: string): void {
    this.lastKeyword = keyword;
    if (!keyword.trim()) {
      this.results.set(EMPTY_RESULT);
      this.isLoading.set(false);
      return;
    }
    this.results.update((r) => ({ ...r, menus: this.searchMenus(keyword) }));
    this.query$.next(keyword);
  }

  recordRecent(keyword: string): void {
    const trimmed = keyword.trim();
    if (!trimmed) return;
    const next = [trimmed, ...this.recentSearches().filter((k) => k !== trimmed)].slice(0, RECENT_MAX);
    this.recentSearches.set(next);
    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    } catch { /* ignore */ }
  }

  clearRecent(): void {
    this.recentSearches.set([]);
    try {
      localStorage.removeItem(RECENT_KEY);
    } catch { /* ignore */ }
  }

  private loadRecent(): string[] {
    try {
      const raw = localStorage.getItem(RECENT_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private searchMenus(keyword: string): MenuHit[] {
    const kw = keyword.toLowerCase();
    const all = this.getFlatMenuItems();
    return all.filter((m) => m.label.toLowerCase().includes(kw)).slice(0, 8);
  }

  private getFlatMenuItems(): MenuHit[] {
    if (this.flatMenuItems) return this.flatMenuItems;
    // ยังไม่โหลดเมนู — คืนรายการว่างไปก่อน แล้วค่อยโหลดแบบ async สำหรับครั้งถัดไป
    this.flatMenuItems = [];
    this.sidebarService.getMenu().subscribe((menu) => {
      this.flatMenuItems = this.flattenMenu(menu);
    });
    return this.flatMenuItems;
  }

  private flattenMenu(items: MenuItemModel[], out: MenuHit[] = []): MenuHit[] {
    for (const item of items) {
      if (item.path) {
        out.push({ code: item.code, label: item.name, icon: item.icon, path: `/feature/${item.path}` });
      }
      if (item.children?.length) {
        this.flattenMenu(item.children, out);
      }
    }
    return out;
  }
}
