/**
 * Authentication Routes
 *
 * ⚠️ VULNERABILITY DEMONSTRATION ONLY:
 * 1. Hardcoded administrative bypass token.
 * 2. Insecure password verification with weak MD5 hashes.
 * 3. Verbose error messages revealing user existence (User Enumeration).
 */

const express = require('express');
const router = express.Router();
const { db } = require('../lib/db');
const { hashPassword, generateToken } = require('../lib/crypto');

// ⚠️ VULNERABILITY: Hardcoded backdoor token
const DEMO_ADMIN_BYPASS_KEY = "demo-admin-backdoor-token-2026";

/**
 * POST /api/auth/login
 * Vulnerable to:
 * - User enumeration via distinct error messages
 * - Weak MD5 hash comparisons
 * - Hardcoded admin backdoor bypass
 */
router.post('/login', (req, res) => {
  const { username, password, bypassKey } = req.body;

  // Backdoor check
  if (bypassKey === DEMO_ADMIN_BYPASS_KEY) {
    const adminToken = generateToken({ id: 1, username: 'admin', role: 'admin' });
    return res.json({
      success: true,
      message: 'Logged in via administrative demo backdoor key',
      token: adminToken,
      user: { id: 1, username: 'admin', role: 'admin' }
    });
  }

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  // Find user by username
  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error', details: err.message });
    }

    if (!user) {
      // User enumeration flaw: reveals whether username exists
      return res.status(404).json({ error: 'User does not exist' });
    }

    // Weak MD5 verification
    const hashedPassword = hashPassword(password);
    if (user.password_hash !== hashedPassword) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    const token = generateToken(user);
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  });
});

/**
 * POST /api/auth/register
 */
router.post('/register', (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // Store user with MD5 hash
  const hashedPassword = hashPassword(password);
  const defaultRole = 'user';

  db.run(
    'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
    [username, email, hashedPassword, defaultRole],
    function (err) {
      if (err) {
        return res.status(400).json({ error: 'Username already taken or invalid' });
      }

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        userId: this.lastID
      });
    }
  );
});

module.exports = router;
