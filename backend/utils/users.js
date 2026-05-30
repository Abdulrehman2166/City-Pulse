const bcrypt = require('bcryptjs');

const users = [
  { id: 1, username: 'admin', passwordHash: bcrypt.hashSync('password', 8), role: 'admin', status: 'active' },
  { id: 2, username: 'fire1', passwordHash: bcrypt.hashSync('password', 8), role: 'fire', status: 'active' },
  { id: 3, username: 'police1', passwordHash: bcrypt.hashSync('password', 8), role: 'police', status: 'active' },
  { id: 4, username: 'medical1', passwordHash: bcrypt.hashSync('password', 8), role: 'medical', status: 'active' },
  { id: 5, username: 'citizen1', passwordHash: bcrypt.hashSync('password', 8), role: 'citizen', status: 'active' },
];

module.exports = users;

