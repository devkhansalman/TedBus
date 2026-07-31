import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges, SimpleChanges, ChangeDetectorRef, AfterViewChecked, ElementRef, HostListener } from '@angular/core';
import { NotificationService } from '../../service/notification.service';
import { Notification } from '../../model/notification.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-notification-panel',
  standalone: false,
  templateUrl: './notification-panel.html',
  styleUrl: './notification-panel.css'
})
export class NotificationPanel implements OnInit, OnDestroy, OnChanges, AfterViewChecked {
  @Input() isOpen: boolean = false;
  @Output() closed = new EventEmitter<void>();

  notifications: Notification[] = [];
  unreadCount: number = 0;
  isLoading: boolean = true;
  private subscriptions: Subscription = new Subscription();
  private lastLoggedRenderedCount: number = -1;

  constructor(
    public notificationService: NotificationService,
    private cdr: ChangeDetectorRef,
    private elementRef: ElementRef
  ) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.isOpen) return;
    const clickedInside = this.elementRef.nativeElement.contains(event.target as Node);
    if (!clickedInside) {
      this.onClose();
    }
  }

  ngOnInit(): void {
    this.subscriptions.add(
      this.notificationService.notifications$.subscribe(notifications => {
        this.notifications = notifications || [];
        this.isLoading = false;
        this.cdr.detectChanges();
      })
    );
    
    this.subscriptions.add(
      this.notificationService.unreadCount$.subscribe(count => {
        this.unreadCount = count;
        this.cdr.detectChanges();
      })
    );
    
    if (this.isOpen) {
      this.notificationService.fetchNotifications();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && changes['isOpen'].currentValue) {
      this.isClosing = false;
      this.isLoading = true;
      this.notificationService.fetchNotifications();
      this.cdr.detectChanges();
    }
  }

  get templateDataLength(): number {
    return this.notifications ? this.notifications.length : 0;
  }

  ngAfterViewChecked(): void {
    if (this.isOpen && !this.isLoading) {
      const renderedCards = document.querySelectorAll('.notification-card');
      if (renderedCards.length !== this.lastLoggedRenderedCount) {
        this.lastLoggedRenderedCount = renderedCards.length;
      }
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  onMarkAsRead(id: string, isRead: boolean): void {
    if (!isRead) {
      this.notificationService.markAsRead(id);
    }
  }

  onMarkAllAsRead(): void {
    this.notificationService.markAllAsRead();
  }

  onDelete(id: string, event: Event): void {
    event.stopPropagation();
    this.notificationService.deleteNotification(id);
  }

  isClosing: boolean = false;

  onClose(): void {
    if (this.isClosing) return;
    this.isClosing = true;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.isClosing = false;
      this.isOpen = false;
      this.closed.emit();
      this.cdr.detectChanges();
    }, 150);
  }

  getTypeColor(type: string): string {
    switch (type) {
      case 'booking': return 'text-blue-500 bg-blue-100 dark:bg-blue-900/30';
      case 'payment': return 'text-green-500 bg-green-100 dark:bg-green-900/30';
      case 'trip': return 'text-orange-500 bg-orange-100 dark:bg-orange-900/30';
      case 'review': return 'text-purple-500 bg-purple-100 dark:bg-purple-900/30';
      case 'offer': return 'text-red-500 bg-red-100 dark:bg-red-900/30';
      case 'system':
      default: return 'text-gray-500 bg-gray-100 dark:bg-gray-800';
    }
  }
}
