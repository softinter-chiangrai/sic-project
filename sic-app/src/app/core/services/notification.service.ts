import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, firstValueFrom, Subject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SicToastService } from '../component/sic-toast/sic-toast.service';

export interface AppNotification {
  id: string;
  recipientUserId: string;
  senderId?: string;
  senderName?: string;
  title: string;
  message: string;
  type: string;
  linkUrl?: string;
  read: boolean;
  createdDate: string | Date;
}

export interface NotificationPageResponse {
  items: AppNotification[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasMore: boolean;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly http = inject(HttpClient);
  private readonly toastService = inject(SicToastService);

  readonly notifications$ = new BehaviorSubject<AppNotification[]>([]);
  readonly unreadCount$ = new BehaviorSubject<number>(0);
  readonly newNotificationReceived$ = new Subject<AppNotification>();

  async loadNotifications(page = 0, size = 15, unreadOnly = false): Promise<NotificationPageResponse | null> {
    if (!isPlatformBrowser(this.platformId)) return null;
    try {
      const res = await firstValueFrom(
        this.http.get<any>(`${environment.apiBaseUrl}/api/su/notifications`, {
          params: { page: page.toString(), size: size.toString(), unreadOnly: unreadOnly.toString() }
        }),
      );

      let items: AppNotification[] = [];
      let pageData: NotificationPageResponse;

      if (Array.isArray(res)) {
        items = res;
        pageData = {
          items,
          page: 0,
          size: items.length,
          totalElements: items.length,
          totalPages: 1,
          hasMore: false
        };
      } else {
        items = res.items || [];
        pageData = res;
      }

      if (page === 0) {
        this.notifications$.next(items);
      } else {
        const current = this.notifications$.getValue();
        // deduplicate by id
        const existingIds = new Set(current.map(n => n.id));
        const newItems = items.filter(n => !existingIds.has(n.id));
        this.notifications$.next([...current, ...newItems]);
      }

      this.loadUnreadCount();
      return pageData;
    } catch (err) {
      console.error('[NotificationService] loadNotifications error:', err);
      return null;
    }
  }

  async fetchNotificationsPage(page: number, size = 15, unreadOnly = false): Promise<NotificationPageResponse | null> {
    if (!isPlatformBrowser(this.platformId)) return null;
    try {
      const res = await firstValueFrom(
        this.http.get<any>(`${environment.apiBaseUrl}/api/su/notifications`, {
          params: { page: page.toString(), size: size.toString(), unreadOnly: unreadOnly.toString() }
        }),
      );

      if (Array.isArray(res)) {
        return {
          items: res,
          page: 0,
          size: res.length,
          totalElements: res.length,
          totalPages: 1,
          hasMore: false
        };
      }
      return res;
    } catch (err) {
      console.error('[NotificationService] fetchNotificationsPage error:', err);
      return null;
    }
  }

  async loadUnreadCount(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      const res = await firstValueFrom(
        this.http.get<{ unreadCount: number }>(`${environment.apiBaseUrl}/api/su/notifications/unread-count`),
      );
      this.unreadCount$.next(res.unreadCount);
    } catch (err) {
      console.error('[NotificationService] loadUnreadCount error:', err);
    }
  }

  async markAsRead(id: string): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      await firstValueFrom(
        this.http.put(`${environment.apiBaseUrl}/api/su/notifications/${id}/read`, {}),
      );
      const current = this.notifications$.getValue();
      const updated = current.map(n => n.id === id ? { ...n, read: true } : n);
      this.notifications$.next(updated);
      this.unreadCount$.next(Math.max(0, this.unreadCount$.getValue() - 1));
    } catch (err) {
      console.error('[NotificationService] markAsRead error:', err);
    }
  }

  async markAllAsRead(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      await firstValueFrom(
        this.http.put(`${environment.apiBaseUrl}/api/su/notifications/read-all`, {}),
      );
      const current = this.notifications$.getValue();
      const updated = current.map(n => ({ ...n, read: true }));
      this.notifications$.next(updated);
      this.unreadCount$.next(0);
    } catch (err) {
      console.error('[NotificationService] markAllAsRead error:', err);
    }
  }

  showToastNotification(
    message: string,
    type: 'info' | 'success' | 'danger' | 'warning' = 'info',
    duration = 4000,
    linkUrl?: string
  ): void {
    this.toastService.show(message, { type, duration, linkUrl });
  }

  handleIncomingNotification(notification: AppNotification): void {
    const current = this.notifications$.getValue();
    this.notifications$.next([notification, ...current]);
    this.unreadCount$.next(this.unreadCount$.getValue() + 1);
    this.newNotificationReceived$.next(notification);

    // Show toast with clickable linkUrl and title
    if (notification.message || notification.title) {
      this.toastService.show(notification.message || '', {
        title: notification.title,
        type: 'info',
        duration: 5000,
        linkUrl: notification.linkUrl,
      });
    }
  }
}
