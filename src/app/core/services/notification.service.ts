import { Injectable, signal, computed } from '@angular/core';
import { AppNotification } from '../models';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private readonly notifications = signal<AppNotification[]>([]);

  readonly notifications$ = this.notifications.asReadonly();

  readonly unreadCount = computed(() =>
    this.notifications().filter(n => !n.read).length
  );

  addNotification(notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>): AppNotification {
    const notification: AppNotification = {
      ...notif,
      id: `notif_${Date.now()}`,
      timestamp: new Date(),
      read: false,
    };
    this.notifications.update(list => [notification, ...list]);

    // Auto-remove after 5 seconds for success/info
    if (notif.type === 'success' || notif.type === 'info') {
      setTimeout(() => this.removeNotification(notification.id), 5000);
    }

    return notification;
  }

  markAsRead(id: string): void {
    this.notifications.update(list =>
      list.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  }

  removeNotification(id: string): void {
    this.notifications.update(list => list.filter(n => n.id !== id));
  }

  clearAll(): void {
    this.notifications.set([]);
  }

  getNotification(id: string): AppNotification | undefined {
    return this.notifications().find(n => n.id === id);
  }

  getAllNotifications(): AppNotification[] {
    return this.notifications();
  }

  getUnreadNotifications(): AppNotification[] {
    return this.notifications().filter(n => !n.read);
  }
}
