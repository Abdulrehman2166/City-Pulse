const express = require('express');
const router = express.Router();
const users = require('../utils/users');
const store = require('../utils/incidentsStore');
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

// GET /api/admin/resolved - get all resolved incidents
router.get('/resolved', async (req, res) => {
  try {
    const allIncidents = await store.getAllIncidents();
    const resolvedIncidents = allIncidents.filter(inc => inc.status === 'resolved' || inc.status === 'completed');
    res.json({ incidents: resolvedIncidents });
  } catch (err) {
    console.error('Error fetching resolved cases:', err);
    res.status(500).json({ message: 'Failed to fetch resolved cases' });
  }
});

// DELETE /api/admin/incidents/:id - delete any incident (admin only)
router.delete('/incidents/:id', async (req, res) => {
  try {
    const deleted = await store.deleteIncident(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Incident not found' });
    }
    res.json({ message: 'Incident deleted successfully' });
  } catch (err) {
    console.error('Error deleting incident:', err);
    res.status(500).json({ message: 'Failed to delete incident' });
  }
});

module.exports = router;
