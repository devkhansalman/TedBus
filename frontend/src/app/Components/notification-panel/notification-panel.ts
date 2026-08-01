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
  isClosing: boolean = false;
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

  @HostListener('document:keydown.escape')
  handleEscape(): void {
    if (this.isOpen) {
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
    if (changes['isOpen']) {
      if (changes['isOpen'].currentValue) {
        this.isClosing = false;
        this.isLoading = true;
        document.body.style.overflow = 'hidden';
        this.notificationService.fetchNotifications();
        this.cdr.detectChanges();
      } else {
        document.body.style.overflow = '';
      }
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
    document.body.style.overflow = '';
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

  onClose(): void {
    if (this.isClosing) return;
    this.isClosing = true;
    document.body.style.overflow = '';
    this.cdr.detectChanges();
    setTimeout(() => {
      this.isClosing = false;
      this.isOpen = false;
      this.closed.emit();
      this.cdr.detectChanges();
    }, 220);
  }

  getTypeColor(type: string): string {
    switch (type) {
      case 'booking': return 'text-blue-600 bg-blue-100 dark:bg-blue-950/60 dark:text-blue-400';
      case 'payment': return 'text-emerald-600 bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-400';
      case 'trip': return 'text-amber-600 bg-amber-100 dark:bg-amber-950/60 dark:text-amber-400';
      case 'review': return 'text-purple-600 bg-purple-100 dark:bg-purple-950/60 dark:text-purple-400';
      case 'offer': return 'text-red-600 bg-red-100 dark:bg-red-950/60 dark:text-red-400';
      case 'system':
      default: return 'text-slate-600 bg-slate-100 dark:bg-slate-700 dark:text-slate-300';
    }
  }
}

