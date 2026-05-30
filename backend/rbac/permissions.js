const PERMISSIONS = {
  // Citizen
  CITIZEN_INCIDENT_CREATE: 'citizen:incident:create',
  CITIZEN_INCIDENT_READ_OWN: 'citizen:incident:read_own',
  CITIZEN_ANALYTICS_READ_OWN: 'citizen:analytics:read_own',

  // Police
  POLICE_INCIDENT_READ_ASSIGNED: 'police:incident:read_assigned',
  POLICE_INCIDENT_UPDATE_ASSIGNED: 'police:incident:update_assigned',
  POLICE_ANALYTICS_READ: 'police:analytics:read',

  // Fire
  FIRE_INCIDENT_READ_ASSIGNED: 'fire:incident:read_assigned',
  FIRE_INCIDENT_UPDATE_ASSIGNED: 'fire:incident:update_assigned',
  FIRE_ANALYTICS_READ: 'fire:analytics:read',

  // Medical
  MEDICAL_INCIDENT_READ_ASSIGNED: 'medical:incident:read_assigned',
  MEDICAL_INCIDENT_UPDATE_ASSIGNED: 'medical:incident:update_assigned',
  MEDICAL_ANALYTICS_READ: 'medical:analytics:read',

  // Admin (kept for existing admin router)
  ADMIN_USERS_READ: 'admin:users:read',
  ADMIN_USERS_DELETE: 'admin:users:delete',
};

module.exports = { PERMISSIONS };

