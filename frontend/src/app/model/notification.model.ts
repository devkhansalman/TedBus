export interface Notification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: 'booking' | 'payment' | 'trip' | 'review' | 'offer' | 'system';
  priority: 'low' | 'normal' | 'high';
  icon: string;
  isRead: boolean;
  createdAt: string;
  metadata?: Record<string, any>;
}
