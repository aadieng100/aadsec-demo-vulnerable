/**
 * Database Module (SQLite in-memory for zero-setup demo)
 *
 * ⚠️ VULNERABILITY DEMONSTRATION ONLY:
 * 1. Contains an unsafe raw SQL concatenation pattern (SQL Injection).
 * 2. Contains hardcoded fake secrets to test secret scanning (Gitleaks / Semgrep).
 */

const sqlite3 = require('sqlite3').verbose();

// ============================================================================
// ⚠️ FAKE SECRET PLACEHOLDER FOR AADSEC DEMO
// These are NOT real credentials. They exist solely to demonstrate
// automated secret detection (Gitleaks, Semgrep, Trivy).
// ============================================================================
const DEMO_DB_CONNECTION_STRING = "postgres://aadsec_demo_user:P@ssw0rdFakeSecret2026!@db.internal.demo.aadsec.local:5432/customer_db";
const DEMO_AWS_BACKUP_ACCESS_KEY = "AKIAIOSFODNN7EXAMPLE";
const DEMO_AWS_BACKUP_SECRET_KEY = "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY";

// Initialize in-memory SQLite database
const db = new sqlite3.Database(':memory:', (err) => {
  if (err) {
    console.error('Failed to open in-memory database:', err.message);
  } else {
    console.log('Connected to in-memory SQLite database for demo.');
    initSchema();
  }
});

function initSchema() {
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user',
        api_key TEXT
      )
    `);

    // Seed sample users with simple MD5 hashes (see lib/crypto.js)
    // admin / admin123 (hash: 0192023a7bbd73250516f069df18b500)
    // alice / password (hash: 5f4dcc3b5aa765d61d8327deb882cf99)
    // bob   / secret   (hash: 5ebe2294ecd0e0f08eab7690d2a6ee69)
    const stmt = db.prepare('INSERT INTO users (username, email, password_hash, role, api_key) VALUES (?, ?, ?, ?, ?)');
    stmt.run('admin', 'admin@aadsec-demo.local', '0192023a7bbd73250516f069df18b500', 'admin', 'aadsec_key_admin_supersecret_001');
    stmt.run('alice', 'alice@aadsec-demo.local', '5f4dcc3b5aa765d61d8327deb882cf99', 'developer', 'aadsec_key_alice_dev_002');
    stmt.run('bob', 'bob@aadsec-demo.local', '5ebe2294ecd0e0f08eab7690d2a6ee69', 'guest', 'aadsec_key_bob_guest_003');
    stmt.finalize();
  });
}

/**
 * ⚠️ VULNERABLE FUNCTION: Raw SQL string concatenation.
 *
 * Vulnerable to classic SQL injection payloads:
 * e.g. "admin' OR '1'='1" or "' UNION SELECT id, username, password_hash, api_key, email FROM users--"
 */
function unsafeSearchUsers(userQuery, callback) {
  // Deliberate SQL Injection flaw: string interpolation without parameterized queries
  const sql = `SELECT id, username, email, role FROM users WHERE username = '${userQuery}'`;
  console.log(`[DB EXECUTING UNSAFE SQL]: ${sql}`);
  db.all(sql, (err, rows) => {
    callback(err, rows);
  });
}

module.exports = {
  db,
  unsafeSearchUsers,
  DEMO_DB_CONNECTION_STRING,
  DEMO_AWS_BACKUP_ACCESS_KEY
};
