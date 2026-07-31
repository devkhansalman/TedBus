import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { url } from '../config';
import { Notification } from '../model/notification.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private http: HttpClient) {
    // Automatically load unread count and notifications on application startup
    this.fetchUnreadCount();
    this.fetchNotifications();
  }

  private get headers(): HttpHeaders {
    let email = '';
    const loggedInUserStr = sessionStorage.getItem('Loggedinuser');
    if (loggedInUserStr) {
      try {
        const user = JSON.parse(loggedInUserStr);
        if (user && user.email) {
          email = user.email;
        }
      } catch (e) {
        console.error('Error parsing logged in user', e);
      }
    }
    if (!email) {
      email = 'demo@tedbus.com';
    }
    return new HttpHeaders({ 'x-user-email': email });
  }

  fetchNotifications(): void {
    console.log('[Frontend Request] NotificationService sending GET /notifications with x-user-email:', this.headers.get('x-user-email'));
    this.http.get<Notification[]>(`${url}notifications`, { headers: this.headers })
      .subscribe({
        next: (notifications) => {
          console.log('[API Response] NotificationService received API response:', notifications ? notifications.length : 0, 'notifications');
          console.log('[BehaviorSubject.next()] Emitting notifications array to BehaviorSubject. Length:', notifications ? notifications.length : 0);
          this.notificationsSubject.next(notifications || []);
        },
        error: (err) => {
          console.error('[Angular Service Error] fetching notifications', err);
          this.notificationsSubject.next([]);
        }
      });
  }

  fetchUnreadCount(): void {
    console.log('[Frontend Request] NotificationService sending GET /notifications/unread-count with x-user-email:', this.headers.get('x-user-email'));
    this.http.get<{ unreadCount: number }>(`${url}notifications/unread-count`, { headers: this.headers })
      .subscribe({
        next: (res) => {
          console.log('[Angular Service] Received GET /notifications/unread-count response:', res.unreadCount);
          this.unreadCountSubject.next(res.unreadCount);
        },
        error: (err) => console.error('[Angular Service Error] fetching unread count', err)
      });
  }

  markAsRead(id: string): void {
    this.http.patch(`${url}notifications/${id}/read`, {}, { headers: this.headers })
      .subscribe({
        next: () => {
          const current = this.notificationsSubject.value;
          const updated = current.map(n => n._id === id ? { ...n, isRead: true } : n);
          this.notificationsSubject.next(updated);
          this.fetchUnreadCount();
        },
        error: (err) => console.error('Error marking notification as read', err)
      });
  }

  markAllAsRead(): void {
    this.http.patch(`${url}notifications/read-all`, {}, { headers: this.headers })
      .subscribe({
        next: () => {
          const current = this.notificationsSubject.value;
          const updated = current.map(n => ({ ...n, isRead: true }));
          this.notificationsSubject.next(updated);
          this.fetchUnreadCount();
        },
        error: (err) => console.error('Error marking all as read', err)
      });
  }

  deleteNotification(id: string): void {
    this.http.delete(`${url}notifications/${id}`, { headers: this.headers })
      .subscribe({
        next: () => {
          const current = this.notificationsSubject.value;
          const updated = current.filter(n => n._id !== id);
          this.notificationsSubject.next(updated);
          this.fetchUnreadCount();
        },
        error: (err) => console.error('Error deleting notification', err)
      });
  }

  getRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const mins = Math.floor(diffInSeconds / 60);
      return `${mins} minute${mins > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 172800) {
      return 'Yesterday';
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  }
}
