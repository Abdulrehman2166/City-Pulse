const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const users = require('../utils/users');

const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: 'username and password required' });

  // SECURITY: never trust a client-provided role during login
  const user = users.find(u => u.username === username);
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) return res.status(401).json({ message: 'Invalid credentials' });

  const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '8h' });
  res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
});

// Simple signup for testing (creates user in memory)
router.post('/signup', async (req, res) => {
  const { username, password } = req.body;
  const requestedRole = req.body?.role;
  if (!username || !password) return res.status(400).json({ message: 'username and password required' });

  // SECURITY: self-service signups must never create privileged roles
  const role = requestedRole === 'citizen' ? 'citizen' : 'citizen';
  if (users.find(u => u.username === username)) return res.status(409).json({ message: 'User exists' });

  const id = users.length + 1;
  const passwordHash = await bcrypt.hash(password, 8);
  const user = { id, username, passwordHash, role };
  users.push(user);

  const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '8h' });
  res.status(201).json({ token, user: { id: user.id, username: user.username, role: user.role } });
});

module.exports = router;
