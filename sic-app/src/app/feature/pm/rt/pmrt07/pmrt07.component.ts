import {
  Component,
  OnInit,
  computed,
  inject,
  signal,
  ChangeDetectionStrategy,
  HostListener,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NotificationService, AppNotification } from '../../../../core/services/notification.service';
import dayjs from '../../../../core/dayjs';

@Component({
  selector: 'app-pmrt07',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterModule, TranslateModule],
  templateUrl: './pmrt07.component.html',
  styleUrl: './pmrt07.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Pmrt07Component implements OnInit {
  private readonly elementRef = inject(ElementRef);
  private readonly router = inject(Router);
  readonly notificationSvc = inject(NotificationService);

  readonly activeTab = signal<'all' | 'unread'>('all');
  readonly showMenu = signal<boolean>(false);

  // Pagination state
  readonly currentPage = signal<number>(0);
  readonly pageSize = 15;
  readonly hasMore = signal<boolean>(true);
  readonly isLoading = signal<boolean>(false);

  readonly allNotifications = signal<AppNotification[]>([]);

  ngOnInit(): void {
    this.fetchData(0, true);

    // Sync live changes
    this.notificationSvc.notifications$.subscribe((items) => {
      if (this.currentPage() === 0) {
        this.allNotifications.set(items || []);
      }
    });
  }

  async fetchData(page: number, reset = false) {
    if (this.isLoading()) return;
    this.isLoading.set(true);

    const isUnreadTab = this.activeTab() === 'unread';
    const res = await this.notificationSvc.fetchNotificationsPage(page, this.pageSize, isUnreadTab);
    this.isLoading.set(false);

    if (res) {
      this.currentPage.set(res.page);
      this.hasMore.set(res.hasMore);

      if (reset || page === 0) {
        this.allNotifications.set(res.items || []);
      } else {
        const current = this.allNotifications();
        const existingIds = new Set(current.map((n) => n.id));
        const newItems = (res.items || []).filter((n) => !existingIds.has(n.id));
        this.allNotifications.set([...current, ...newItems]);
      }
    }
  }

  readonly filteredNotifications = computed(() => {
    const list = this.allNotifications();
    if (this.activeTab() === 'unread') {
      return list.filter((n) => !n.read);
    }
    return list;
  });

  readonly newNotifications = computed(() => {
    const now = dayjs();
    return this.filteredNotifications().filter((n) => {
      if (!n.createdDate) return false;
      const diffHours = now.diff(dayjs(n.createdDate), 'hour');
      return diffHours < 24;
    });
  });

  readonly earlierNotifications = computed(() => {
    const now = dayjs();
    return this.filteredNotifications().filter((n) => {
      if (!n.createdDate) return true;
      const diffHours = now.diff(dayjs(n.createdDate), 'hour');
      return diffHours >= 24;
    });
  });

  readonly unreadCount = computed(() => {
    return this.allNotifications().filter((n) => !n.read).length;
  });

  setTab(tab: 'all' | 'unread') {
    if (this.activeTab() === tab) return;
    this.activeTab.set(tab);
    this.currentPage.set(0);
    this.hasMore.set(true);
    this.fetchData(0, true);
  }

  toggleMenu(event?: MouseEvent) {
    if (event) event.stopPropagation();
    this.showMenu.update((v) => !v);
  }

  async markAllAsRead() {
    await this.notificationSvc.markAllAsRead();
    const updated = this.allNotifications().map((n) => ({ ...n, read: true }));
    this.allNotifications.set(updated);
    this.showMenu.set(false);
  }

  async loadMore() {
    if (this.isLoading() || !this.hasMore()) return;
    const nextPage = this.currentPage() + 1;
    await this.fetchData(nextPage, false);
  }

  onScroll(event: Event) {
    const target = event.target as HTMLElement;
    if (!target) return;
    const threshold = 100;
    const isBottom = target.scrollHeight - target.scrollTop - target.clientHeight <= threshold;
    if (isBottom && this.hasMore() && !this.isLoading()) {
      this.loadMore();
    }
  }

  @HostListener('window:scroll')
  onWindowScroll() {
    const windowHeight = 'innerHeight' in window ? window.innerHeight : document.documentElement.offsetHeight;
    const body = document.body;
    const html = document.documentElement;
    const docHeight = Math.max(
      body.scrollHeight,
      body.offsetHeight,
      html.clientHeight,
      html.scrollHeight,
      html.offsetHeight
    );
    const windowBottom = windowHeight + window.pageYOffset;
    if (windowBottom >= docHeight - 120 && this.hasMore() && !this.isLoading()) {
      this.loadMore();
    }
  }

  resolveLinkUrl(linkUrl?: string): string | null {
    if (!linkUrl) return null;
    let url = linkUrl.trim();
    if (!url.startsWith('/feature/') && !url.startsWith('/management/') && !url.startsWith('/tutorial')) {
      url = '/feature' + (url.startsWith('/') ? url : '/' + url);
    }
    return url;
  }

  onItemClick(item: AppNotification) {
    if (!item.read) {
      this.notificationSvc.markAsRead(item.id);
      const updated = this.allNotifications().map((n) => (n.id === item.id ? { ...n, read: true } : n));
      this.allNotifications.set(updated);
    }
    const resolved = this.resolveLinkUrl(item.linkUrl);
    if (resolved) {
      this.router.navigateByUrl(resolved);
    }
  }

  formatRelativeTime(dateStr: string | Date | undefined): string {
    if (!dateStr) return '';
    const now = dayjs();
    const target = dayjs(dateStr);
    const diffMinutes = now.diff(target, 'minute');
    const diffHours = now.diff(target, 'hour');
    const diffDays = now.diff(target, 'day');

    if (diffMinutes < 1) return 'เพิ่งเมื่อสักครู่';
    if (diffMinutes < 60) return `${diffMinutes} นาทีที่แล้ว`;
    if (diffHours < 24) return `${diffHours} ชั่วโมงที่แล้ว`;
    if (diffDays === 1) return '1 วันที่แล้ว';
    if (diffDays < 7) return `${diffDays} วันที่แล้ว`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} สัปดาห์ที่แล้ว`;
    return target.format('DD/MM/YYYY HH:mm');
  }

  getBadgeIcon(type: string): string {
    switch ((type || '').toUpperCase()) {
      case 'APPROVAL':
        return 'bi-check-circle-fill';
      case 'CHAT':
        return 'bi-chat-dots-fill';
      case 'WARNING':
        return 'bi-exclamation-triangle-fill';
      case 'SUCCESS':
        return 'bi-check2-circle';
      case 'DANGER':
        return 'bi-x-circle-fill';
      default:
        return 'bi-people-fill';
    }
  }

  getBadgeBgClass(type: string): string {
    switch ((type || '').toUpperCase()) {
      case 'APPROVAL':
        return 'bg-[var(--crm-primary)] text-white';
      case 'CHAT':
        return 'bg-blue-500 text-white';
      case 'WARNING':
        return 'bg-amber-500 text-white';
      case 'SUCCESS':
        return 'bg-emerald-500 text-white';
      case 'DANGER':
        return 'bg-rose-500 text-white';
      default:
        return 'bg-[var(--crm-primary)] text-white';
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.showMenu.set(false);
    }
  }
}
export default Pmrt07Component;
