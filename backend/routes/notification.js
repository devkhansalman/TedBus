const express = require('express');
const router = express.Router();

const notificationController = require('../controllers/notification');
const { requireAuthenticatedCustomer } = require('../controllers/customer');

// Log express route access
router.use('/notifications', (req, res, next) => {
    console.log(`[Express Route] ${req.method} ${req.originalUrl} - x-user-email: "${req.get('x-user-email') || ''}"`);
    next();
});

router.get('/notifications', requireAuthenticatedCustomer, notificationController.getNotifications);
router.get('/notifications/unread-count', requireAuthenticatedCustomer, notificationController.getUnreadCount);
router.patch('/notifications/read-all', requireAuthenticatedCustomer, notificationController.markAllAsRead);
router.patch('/notifications/:id/read', requireAuthenticatedCustomer, notificationController.markAsRead);
router.delete('/notifications/:id', requireAuthenticatedCustomer, notificationController.deleteNotification);

module.exports = router;
