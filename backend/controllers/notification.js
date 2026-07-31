const Notification = require('../models/notification');

exports.seedNotifications = async (req, res, next) => {
    try {
        if (!req.customer || !req.customer.email) {
            return next();
        }
        const userId = req.customer.email;
        const existingCount = await Notification.countDocuments({ userId });
        
        if (existingCount === 0) {
            const now = Date.now();
            const dummyNotifications = [
                {
                    userId,
                    type: 'booking',
                    title: 'Booking Confirmed!',
                    message: 'Your bus from Delhi to Jaipur on Aug 15 has been confirmed. Seat numbers: A1, A2.',
                    priority: 'high',
                    icon: 'check_circle',
                    createdAt: new Date(now - 1 * 60 * 60 * 1000) // 1 hour ago
                },
                {
                    userId,
                    type: 'payment',
                    title: 'Payment Successful',
                    message: '₹1,250 has been charged for booking #TDB-78542. View receipt in My Trips.',
                    priority: 'normal',
                    icon: 'payment',
                    createdAt: new Date(now - 2 * 60 * 60 * 1000) // 2 hours ago
                },
                {
                    userId,
                    type: 'trip',
                    title: 'Journey Tomorrow!',
                    message: 'Your trip from Mumbai to Pune departs at 6:30 AM tomorrow. Don\'t forget to arrive 15 min early.',
                    priority: 'high',
                    icon: 'directions_bus',
                    createdAt: new Date(now - 24 * 60 * 60 * 1000) // 1 day ago
                },
                {
                    userId,
                    type: 'review',
                    title: 'How was your trip?',
                    message: 'Rate your recent journey from Bangalore to Chennai. Your feedback helps other travelers!',
                    priority: 'normal',
                    icon: 'rate_review',
                    createdAt: new Date(now - 48 * 60 * 60 * 1000) // 2 days ago
                },
                {
                    userId,
                    type: 'offer',
                    title: 'Weekend Special: 20% OFF!',
                    message: 'Use code WEEKEND20 on all routes this Saturday & Sunday. Book now before seats fill up!',
                    priority: 'low',
                    icon: 'local_offer',
                    createdAt: new Date(now - 72 * 60 * 60 * 1000) // 3 days ago
                },
                {
                    userId,
                    type: 'system',
                    title: 'Profile Updated',
                    message: 'Your profile information has been updated successfully.',
                    priority: 'low',
                    icon: 'account_circle',
                    createdAt: new Date(now - 96 * 60 * 60 * 1000) // 4 days ago
                },
                {
                    userId,
                    type: 'trip',
                    title: 'Journey Completed',
                    message: 'Your trip from Hyderabad to Bangalore has been completed. We hope you had a great journey!',
                    priority: 'normal',
                    icon: 'done_all',
                    createdAt: new Date(now - 120 * 60 * 60 * 1000) // 5 days ago
                }
            ];
            
            await Notification.insertMany(dummyNotifications);
        }
    } catch (error) {
        console.error('[Seed Function Error] Error seeding notifications:', error);
    }
};

exports.getNotifications = async (req, res) => {
    try {
        const userId = req.customer.email;
        
        // Auto-seed on first fetch
        await exports.seedNotifications(req, res);
        
        const notifications = await Notification.find({ userId })
            .sort({ createdAt: -1 })
            .limit(50)
            .exec();
            
        res.status(200).json(notifications);
    } catch (error) {
        console.error('Error getting notifications', error);
        res.status(500).json({ error: "Internal server error" });
    }
};

exports.getUnreadCount = async (req, res) => {
    try {
        const userId = req.customer.email;

        // Auto-seed on unread count fetch if collection is empty
        await exports.seedNotifications(req, res);

        const unreadCount = await Notification.countDocuments({ userId, isRead: false });

        res.status(200).json({ unreadCount });
    } catch (error) {
        console.error('Error getting unread count', error);
        res.status(500).json({ error: "Internal server error" });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        const userId = req.customer.email;
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, userId },
            { isRead: true },
            { new: true }
        );
        
        if (!notification) {
            return res.status(404).json({ error: "Notification not found" });
        }
        
        res.status(200).json(notification);
    } catch (error) {
        console.error('Error marking as read', error);
        res.status(500).json({ error: "Internal server error" });
    }
};

exports.markAllAsRead = async (req, res) => {
    try {
        const userId = req.customer.email;
        const result = await Notification.updateMany(
            { userId, isRead: false },
            { isRead: true }
        );
        
        res.status(200).json({ modifiedCount: result.modifiedCount });
    } catch (error) {
        console.error('Error marking all as read', error);
        res.status(500).json({ error: "Internal server error" });
    }
};

exports.deleteNotification = async (req, res) => {
    try {
        const userId = req.customer.email;
        const notification = await Notification.findOneAndDelete({ _id: req.params.id, userId });
        
        if (!notification) {
            return res.status(404).json({ error: "Notification not found" });
        }
        
        res.status(200).json({ message: "Notification deleted successfully" });
    } catch (error) {
        console.error('Error deleting notification', error);
        res.status(500).json({ error: "Internal server error" });
    }
};
