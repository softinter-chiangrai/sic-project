// src/app/core/component/sic-command-palette/sic-command-palette.component.ts
import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  HostListener,
  inject,
  signal,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  ContractHit,
  CustomerHit,
  GlobalSearchService,
  MenuHit,
  ProjectHit,
} from '../../services/global-search.service';

type PaletteRow =
  | { kind: 'menu'; item: MenuHit }
  | { kind: 'project'; item: ProjectHit }
  | { kind: 'contract'; item: ContractHit }
  | { kind: 'customer'; item: CustomerHit }
  | { kind: 'recent'; item: string };

@Component({
  selector: 'sic-command-palette',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sic-command-palette.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SicCommandPaletteComponent {
  private readonly router = inject(Router);
  protected readonly search = inject(GlobalSearchService);

  @ViewChild('searchInput') searchInputRef?: ElementRef<HTMLInputElement>;

  readonly keyword = signal('');
  readonly activeIndex = signal(0);

  readonly rows = computed<PaletteRow[]>(() => {
    const kw = this.keyword().trim();
    if (!kw) {
      return this.search.recentSearches().map((item) => ({ kind: 'recent', item } as PaletteRow));
    }
    const r = this.search.results();
    return [
      ...r.menus.map((item) => ({ kind: 'menu', item } as PaletteRow)),
      ...r.projects.map((item) => ({ kind: 'project', item } as PaletteRow)),
      ...r.contracts.map((item) => ({ kind: 'contract', item } as PaletteRow)),
      ...r.customers.map((item) => ({ kind: 'customer', item } as PaletteRow)),
    ];
  });

  private readonly sectionMeta: Record<PaletteRow['kind'], { title: string; icon: string }> = {
    recent: { title: 'ค้นหาล่าสุด', icon: 'bi-clock-history' },
    menu: { title: 'เมนู', icon: 'bi-compass' },
    project: { title: 'โครงการ', icon: 'bi-folder2-open' },
    contract: { title: 'สัญญา', icon: 'bi-file-earmark-text' },
    customer: { title: 'ลูกค้า', icon: 'bi-building' },
  };

  readonly sections = computed(() => {
    const out: { title: string; icon: string; rows: { row: PaletteRow; index: number }[] }[] = [];
    let current: (typeof out)[number] | null = null;
    this.rows().forEach((row, index) => {
      const meta = this.sectionMeta[row.kind];
      if (!current || current.title !== meta.title) {
        current = { title: meta.title, icon: meta.icon, rows: [] };
        out.push(current);
      }
      current.rows.push({ row, index });
    });
    return out;
  });

  @HostListener('document:keydown', ['$event'])
  onGlobalKeydown(event: KeyboardEvent): void {
    const isCmdK = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k';
    if (isCmdK) {
      event.preventDefault();
      this.search.toggle();
      if (this.search.isOpen()) {
        queueMicrotask(() => this.searchInputRef?.nativeElement.focus());
      }
      return;
    }

    if (!this.search.isOpen()) return;

    if (event.key === 'Escape') {
      this.close();
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.moveActive(1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.moveActive(-1);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      this.selectActive();
    }
  }

  onKeywordChange(value: string): void {
    this.keyword.set(value);
    this.activeIndex.set(0);
    this.search.search(value);
  }

  onBackdropClick(): void {
    this.close();
  }

  close(): void {
    this.search.close();
    this.keyword.set('');
    this.activeIndex.set(0);
  }

  private moveActive(delta: number): void {
    const len = this.rows().length;
    if (len === 0) return;
    this.activeIndex.set((this.activeIndex() + delta + len) % len);
  }

  private selectActive(): void {
    const row = this.rows()[this.activeIndex()];
    if (row) this.selectRow(row);
  }

  selectRow(row: PaletteRow): void {
    if (row.kind === 'recent') {
      this.keyword.set(row.item);
      this.search.search(row.item);
      return;
    }

    if (this.keyword().trim()) {
      this.search.recordRecent(this.keyword());
    }

    switch (row.kind) {
      case 'menu':
        this.navigate([row.item.path]);
        break;
      case 'project':
        this.navigate(['/feature/pm/project-dashboard'], { projectId: row.item.id });
        break;
      case 'contract':
        this.navigate(['/feature/pm/contract', row.item.id, 'view']);
        break;
      case 'customer':
        this.navigate(['/feature/pm/project'], { customerId: row.item.id });
        break;
    }
    this.close();
  }

  trackByRow(_: number, row: PaletteRow): string {
    switch (row.kind) {
      case 'menu':
        return 'menu-' + row.item.code;
      case 'project':
        return 'project-' + row.item.id;
      case 'contract':
        return 'contract-' + row.item.id;
      case 'customer':
        return 'customer-' + row.item.id;
      case 'recent':
        return 'recent-' + row.item;
    }
  }

  private navigate(commands: any[], queryParams?: Record<string, string>): void {
    this.router.navigate(commands, queryParams ? { queryParams } : undefined);
  }
}
