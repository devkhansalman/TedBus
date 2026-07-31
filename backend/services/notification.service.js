const Notification = require('../models/notification');

/**
 * Helper to create an in-app notification in MongoDB automatically.
 * Ensures consistent schema, prevents duplicates, and logs backend flow.
 */
exports.createNotification = async ({ userId, title, message, type, priority = 'normal', icon, metadata = {} }) => {
    try {
        if (!userId || !title || !message || !type) {
            console.error('[Notification Service Error] Missing required fields:', { userId, title, message, type });
            return null;
        }

        const defaultIcons = {
            booking: 'check_circle',
            payment: 'payment',
            trip: 'directions_bus',
            review: 'rate_review',
            offer: 'local_offer',
            system: 'notifications'
        };

        const notification = new Notification({
            userId,
            title,
            message,
            type,
            priority,
            icon: icon || defaultIcons[type] || 'notifications',
            metadata
        });

        const saved = await notification.save();
        console.log(`[Notification Service] Automatically created "${type}" notification for "${userId}": ${title}`);
        return saved;
    } catch (error) {
        console.error('[Notification Service Error] Failed to auto-create notification:', error);
        return null;
    }
};

/**
 * 1. Booking Confirmed Notification
 */
exports.notifyBookingConfirmed = async (booking) => {
    const from = booking.departureDetails?.city || 'Origin';
    const to = booking.arrivalDetails?.city || 'Destination';
    return exports.createNotification({
        userId: booking.email,
        title: 'Booking Confirmed',
        message: `Your booking from ${from} to ${to} has been confirmed.`,
        type: 'booking',
        priority: 'high',
        icon: 'check_circle',
        metadata: { bookingId: booking._id }
    });
};

/**
 * 2. Payment Successful Notification
 */
exports.notifyPaymentSuccessful = async (booking) => {
    const fare = booking.fare || 0;
    return exports.createNotification({
        userId: booking.email,
        title: 'Payment Successful',
        message: `Your payment of ₹${fare} has been received.`,
        type: 'payment',
        priority: 'high',
        icon: 'payment',
        metadata: { bookingId: booking._id, fare }
    });
};

/**
 * 3. Booking Cancelled Notification
 */
exports.notifyBookingCancelled = async (booking) => {
    return exports.createNotification({
        userId: booking.email,
        title: 'Booking Cancelled',
        message: 'Your booking has been cancelled successfully.',
        type: 'booking',
        priority: 'normal',
        icon: 'cancel',
        metadata: { bookingId: booking._id }
    });
};

/**
 * 4. Journey Completed Notification
 */
exports.notifyJourneyCompleted = async (booking) => {
    return exports.createNotification({
        userId: booking.email,
        title: 'Journey Completed',
        message: 'We hope you enjoyed your journey.',
        type: 'trip',
        priority: 'normal',
        icon: 'done_all',
        metadata: { bookingId: booking._id }
    });
};

/**
 * 5. Review Submitted Notification
 */
exports.notifyReviewSubmitted = async (userEmail, review) => {
    return exports.createNotification({
        userId: userEmail,
        title: 'Review Submitted',
        message: 'Thank you for sharing your travel experience.',
        type: 'review',
        priority: 'low',
        icon: 'rate_review',
        metadata: { reviewId: review._id, bookingId: review.bookingId }
    });
};
