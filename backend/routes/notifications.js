/**
 * notifications.js — Notification Delivery API
 * =============================================
 * GET  /api/notifications        → Fetch unread notifications for the logged-in role
 * GET  /api/notifications/all    → Fetch all notifications (including read)
 * PUT  /api/notifications/:id/read → Mark a notification as read
 * GET  /api/notifications/count  → Get unread count for the logged-in role
 * GET  /api/notifications/adrs   → Admin only: get all Admin Decision Requests
 */

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  getNotificationsForRole,
  getADRsForAdmin,
  markNotificationRead,
  getAllNotifications,
  getUnreadCount,
} = require('../utils/notificationManager');

router.use(authenticate);

// GET /api/notifications — Unread notifications for the authenticated role
router.get('/', (req, res) => {
  const role = req.user.role;
  const includeRead = req.query.includeRead === 'true';
  const notifications = getNotificationsForRole(role, includeRead);
  res.json({ notifications, role });
});

// GET /api/notifications/count — Unread count badge for navbar
router.get('/count', (req, res) => {
  const role = req.user.role;
  const count = getUnreadCount(role);
  res.json({ count, role });
});

// GET /api/notifications/all — All notifications (admin: all roles, others: own role)
router.get('/all', (req, res) => {
  const role = req.user.role;
  if (role === 'admin') {
    const all = getAllNotifications();
    res.json({ notifications: all });
  } else {
    const notifs = getNotificationsForRole(role, true);
    res.json({ notifications: notifs });
  }
});

// GET /api/notifications/adrs — Admin Decision Requests (admin only)
router.get('/adrs', (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required for ADR queue.' });
  }
  const stateFilter = req.query.state || null; // e.g. ?state=pending
  const adrs = getADRsForAdmin(stateFilter);
  res.json({ adrs });
});

// PUT /api/notifications/:id/read — Mark notification read
router.put('/:id/read', (req, res) => {
  const role = req.user.role;
  const notif = markNotificationRead(req.params.id, role);
  if (!notif) {
    return res.status(404).json({ message: 'Notification not found or access denied.' });
  }
  res.json({ notification: notif });
});

module.exports = router;
