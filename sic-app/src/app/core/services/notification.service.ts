import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, firstValueFrom, Subject } from 'rxjs';
import { environment } from '../../../environments/environment';

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

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly http = inject(HttpClient);

  readonly notifications$ = new BehaviorSubject<AppNotification[]>([]);
  readonly unreadCount$ = new BehaviorSubject<number>(0);
  readonly newNotificationReceived$ = new Subject<AppNotification>();

  async loadNotifications(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      const list = await firstValueFrom(
        this.http.get<AppNotification[]>(`${environment.apiBaseUrl}/api/su/notifications`),
      );
      this.notifications$.next(list);
      const unread = list.filter(n => !n.read).length;
      this.unreadCount$.next(unread);
    } catch (err) {
      console.error('[NotificationService] loadNotifications error:', err);
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

  handleIncomingNotification(notification: AppNotification): void {
    const current = this.notifications$.getValue();
    this.notifications$.next([notification, ...current]);
    this.unreadCount$.next(this.unreadCount$.getValue() + 1);
    this.newNotificationReceived$.next(notification);
  }
}
