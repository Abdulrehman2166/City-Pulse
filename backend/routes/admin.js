const express = require('express');
const router = express.Router();
const users = require('../utils/users');
const { authenticate, authorize } = require('../middleware/auth');
const { PERMISSIONS } = require('../rbac/permissions');

// Protect all admin endpoints with admin-only authorization
router.use(authenticate, authorize('admin'));

// GET /api/admin/users
router.get('/users', (req, res) => {
  if (!(req.user.permissions || []).includes(PERMISSIONS.ADMIN_USERS_READ)) {
    return res.status(403).json({ message: 'Access denied: Missing required permission(s)' });
  }
  res.json({ users });
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', (req, res) => {
  if (!(req.user.permissions || []).includes(PERMISSIONS.ADMIN_USERS_DELETE)) {
    return res.status(403).json({ message: 'Access denied: Missing required permission(s)' });
  }
  const { id } = req.params;
  const idx = users.findIndex(u => u.id === parseInt(id));
  if (idx !== -1) {
    users.splice(idx, 1);
    return res.json({ message: 'User deleted successfully' });
  }
  res.status(404).json({ message: 'User not found' });
});

module.exports = router;
