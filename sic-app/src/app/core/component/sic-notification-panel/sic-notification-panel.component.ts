import {
  Component,
  EventEmitter,
  Input,
  Output,
  computed,
  inject,
  signal,
  ChangeDetectionStrategy,
  HostListener,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NotificationService, AppNotification } from '../../services/notification.service';
import dayjs from '../../../core/dayjs';

@Component({
  selector: 'sic-notification-panel',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
  templateUrl: './sic-notification-panel.component.html',
  styleUrl: './sic-notification-panel.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SicNotificationPanelComponent {
  private readonly elementRef = inject(ElementRef);
  private readonly router = inject(Router);
  readonly notificationSvc = inject(NotificationService);

  @Input() isOpen = false;
  @Output() closePanel = new EventEmitter<void>();

  readonly activeTab = signal<'all' | 'unread'>('all');
  readonly showMenu = signal(false);

  // Pagination / Infinite scroll state
  readonly currentPage = signal<number>(0);
  readonly hasMore = signal<boolean>(true);
  readonly isLoading = signal<boolean>(false);

  // Group notifications into New (<24 hours) and Earlier (>= 24 hours)
  readonly allNotifications = signal<AppNotification[]>([]);

  constructor() {
    this.notificationSvc.notifications$.subscribe((items) => {
      this.allNotifications.set(items || []);
    });
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
    this.activeTab.set(tab);
  }

  toggleMenu(event?: MouseEvent) {
    if (event) event.stopPropagation();
    this.showMenu.update((v) => !v);
  }

  markAllAsRead() {
    this.notificationSvc.markAllAsRead();
    this.showMenu.set(false);
  }

  async loadMore() {
    if (this.isLoading() || !this.hasMore()) return;
    this.isLoading.set(true);
    const nextPage = this.currentPage() + 1;
    const res = await this.notificationSvc.loadNotifications(nextPage, 15);
    this.isLoading.set(false);
    if (res) {
      this.currentPage.set(res.page);
      this.hasMore.set(res.hasMore);
    }
  }

  onScroll(event: Event) {
    const target = event.target as HTMLElement;
    if (!target) return;
    const threshold = 60; // 60px from bottom
    const isBottom = target.scrollHeight - target.scrollTop - target.clientHeight <= threshold;
    if (isBottom && this.hasMore() && !this.isLoading()) {
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

  onViewAllClick() {
    this.closePanel.emit();
    this.router.navigate(['/feature/pm/notifications']);
  }

  onItemClick(item: AppNotification) {
    if (!item.read) {
      this.notificationSvc.markAsRead(item.id);
    }
    const resolved = this.resolveLinkUrl(item.linkUrl);
    if (resolved) {
      this.closePanel.emit();
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
    if (diffHours < 24) return `${diffHours} ชั่วโมง`;
    if (diffDays === 1) return '1 วัน';
    if (diffDays < 7) return `${diffDays} วัน`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} สัปดาห์`;
    return target.format('DD/MM/YYYY');
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
