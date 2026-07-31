import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { NotificationService } from './notification.service';
import { Notification } from '../model/notification.model';
import { url } from '../config';

describe('NotificationService', () => {
  let service: NotificationService;
  let httpMock: HttpTestingController;

  const mockNotifications: Notification[] = [
    {
      _id: '1',
      userId: 'test@example.com',
      title: 'Booking Confirmed',
      message: 'Your booking has been confirmed',
      type: 'booking',
      priority: 'high',
      icon: 'check_circle',
      isRead: false,
      createdAt: new Date().toISOString()
    },
    {
      _id: '2',
      userId: 'test@example.com',
      title: 'Payment Received',
      message: 'Payment of $50 received',
      type: 'payment',
      priority: 'normal',
      icon: 'payment',
      isRead: true,
      createdAt: new Date().toISOString()
    }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [NotificationService]
    });
    service = TestBed.inject(NotificationService);
    httpMock = TestBed.inject(HttpTestingController);

    sessionStorage.setItem('Loggedinuser', JSON.stringify({ email: 'test@example.com' }));
  });

  afterEach(() => {
    httpMock.verify();
    sessionStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch notifications', () => {
    service.fetchNotifications();

    const req = httpMock.expectOne(`${url}notifications`);
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('x-user-email')).toBe('test@example.com');
    req.flush(mockNotifications);

    service.notifications$.subscribe(notifications => {
      expect(notifications.length).toBe(2);
      expect(notifications[0].title).toBe('Booking Confirmed');
    });
  });

  it('should fetch unread count', () => {
    service.fetchUnreadCount();

    const req = httpMock.expectOne(`${url}notifications/unread-count`);
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('x-user-email')).toBe('test@example.com');
    req.flush({ unreadCount: 1 });

    service.unreadCount$.subscribe(count => {
      expect(count).toBe(1);
    });
  });

  it('should mark single notification as read', () => {
    (service as any).notificationsSubject.next(mockNotifications);
    service.markAsRead('1');

    const patchReq = httpMock.expectOne(`${url}notifications/1/read`);
    expect(patchReq.request.method).toBe('PATCH');
    patchReq.flush({ ...mockNotifications[0], isRead: true });

    const countReq = httpMock.expectOne(`${url}notifications/unread-count`);
    expect(countReq.request.method).toBe('GET');
    countReq.flush({ unreadCount: 0 });

    service.notifications$.subscribe(notifications => {
      expect(notifications.find(n => n._id === '1')?.isRead).toBeTrue();
    });
  });

  it('should mark all notifications as read', () => {
    (service as any).notificationsSubject.next(mockNotifications);
    service.markAllAsRead();

    const patchReq = httpMock.expectOne(`${url}notifications/read-all`);
    expect(patchReq.request.method).toBe('PATCH');
    patchReq.flush({ modifiedCount: 1 });

    const countReq = httpMock.expectOne(`${url}notifications/unread-count`);
    expect(countReq.request.method).toBe('GET');
    countReq.flush({ unreadCount: 0 });

    service.notifications$.subscribe(notifications => {
      expect(notifications.every(n => n.isRead)).toBeTrue();
    });
  });

  it('should delete notification', () => {
    (service as any).notificationsSubject.next(mockNotifications);
    service.deleteNotification('1');

    const deleteReq = httpMock.expectOne(`${url}notifications/1`);
    expect(deleteReq.request.method).toBe('DELETE');
    deleteReq.flush({ message: 'Notification deleted successfully' });

    const countReq = httpMock.expectOne(`${url}notifications/unread-count`);
    expect(countReq.request.method).toBe('GET');
    countReq.flush({ unreadCount: 0 });

    service.notifications$.subscribe(notifications => {
      expect(notifications.length).toBe(1);
      expect(notifications.find(n => n._id === '1')).toBeUndefined();
    });
  });

  it('should calculate relative time correctly', () => {
    const now = new Date();
    const tenMinsAgo = new Date(now.getTime() - 10 * 60 * 1000).toISOString();
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString();

    expect(service.getRelativeTime(tenMinsAgo)).toBe('10 minutes ago');
    expect(service.getRelativeTime(twoHoursAgo)).toBe('2 hours ago');
  });
});
