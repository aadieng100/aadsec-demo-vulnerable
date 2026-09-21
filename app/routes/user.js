/**
 * User & Admin Routes
 *
 * ⚠️ VULNERABILITY DEMONSTRATION ONLY:
 * 1. SQL Injection in user search endpoint.
 * 2. Unprotected Administrative Endpoints (Missing Access Control / Authorization).
 * 3. Exposure of sensitive data (password hashes, API keys).
 */

const express = require('express');
const router = express.Router();
const { db, unsafeSearchUsers } = require('../lib/db');

/**
 * ⚠️ VULNERABILITY 1: SQL Injection
 * GET /api/users/search?username=...
 *
 * Direct concatenation into SQL statement without sanitization or parameter binding.
 * Example payload:
 *   /api/users/search?username=admin' OR '1'='1
 */
router.get('/search', (req, res) => {
  const query = req.query.username || req.query.q || '';

  if (!query) {
    return res.status(400).json({ error: 'Search query parameter is required (e.g. ?username=alice)' });
  }

  // Calls raw SQL string interpolation
  unsafeSearchUsers(query, (err, rows) => {
    if (err) {
      // Verbose SQL error message leaks database engine info
      return res.status(500).json({
        error: 'SQL execution failed',
        sqlMessage: err.message,
        queryExecuted: query
      });
    }

    res.json({
      count: rows ? rows.length : 0,
      results: rows || []
    });
  });
});

/**
 * ⚠️ VULNERABILITY 4: Missing Authorization on Admin Route
 * GET /api/admin/users
 *
 * This endpoint should require admin role authentication.
 * Instead, it is completely public and dumps all user credentials,
 * password hashes, and internal API keys.
 */
router.get('/admin/users', (req, res) => {
  // Flaw: No role verification middleware, no token validation
  db.all('SELECT id, username, email, password_hash, role, api_key FROM users', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database read failed' });
    }

    res.json({
      warning: 'Administrative view — should not be publicly accessible',
      users: rows
    });
  });
});

/**
 * ⚠️ VULNERABILITY 4 (continued): Unprotected Destructive Admin Action
 * DELETE /api/admin/users/:id
 */
router.delete('/admin/users/:id', (req, res) => {
  const userId = req.params.id;

  // Flaw: Unauthenticated caller can delete any account
  db.run('DELETE FROM users WHERE id = ?', [userId], function (err) {
    if (err) {
      return res.status(500).json({ error: 'Deletion failed' });
    }

    res.json({
      success: true,
      message: `User ${userId} deleted (missing authorization check)`
    });
  });
});

module.exports = router;
