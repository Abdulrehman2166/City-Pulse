const jwt = require('jsonwebtoken');
const { ROLE_PERMISSIONS } = require('../rbac/roles');
const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Access denied: No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const role = decoded?.role;
    req.user = {
      ...decoded,
      role,
      permissions: ROLE_PERMISSIONS[role] || [],
    };
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Access denied: Invalid token' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied: Insufficient permissions' });
    }
    next();
  };
};

const requirePermissions = (...permissions) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Access denied: Not authenticated' });
    const userPerms = req.user.permissions || [];
    const ok = permissions.every(p => userPerms.includes(p));
    if (!ok) return res.status(403).json({ message: 'Access denied: Missing required permission(s)' });
    next();
  };
};

module.exports = { authenticate, authorize, requirePermissions };
