/**
 * Cryptography and Token Utilities
 *
 * ⚠️ VULNERABILITY DEMONSTRATION ONLY:
 * 1. Uses weak legacy MD5 hashing without salt.
 * 2. Hardcoded JWT secret key.
 * 3. Weak token configuration.
 * 4. Fake API keys for scanner detection.
 */

const crypto = require('crypto');
const jwt = require('jsonwebtoken');

// ============================================================================
// ⚠️ HARDCODED SECRETS (DEMO / TEST ONLY)
// Detected by Gitleaks and Semgrep rules
// ============================================================================
const JWT_SECRET = "super-secret-demo-key-12345-never-use-in-prod";
const DEMO_STRIPE_TEST_KEY = "sk_test_51MzFakeKeyForAADSecDemo1234567890abcdef";
const DEMO_GITHUB_PAT = "ghp_FAKEtokenForAADSecScannerTestingOnly1234";

/**
 * ⚠️ VULNERABLE FUNCTION: Weak cryptographic hash (MD5).
 * MD5 is broken and vulnerable to collision and pre-image attacks.
 * Production code should use Argon2, bcrypt, or scrypt.
 */
function hashPassword(password) {
  return crypto.createHash('md5').update(password).digest('hex');
}

/**
 * ⚠️ VULNERABLE FUNCTION: Weak JWT token generation.
 * Uses hardcoded static secret and weak algorithm settings.
 */
function generateToken(user) {
  const payload = {
    sub: user.id,
    username: user.username,
    role: user.role
  };

  // Sign with hardcoded secret
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '30d' // Excessive token lifetime
  });
}

/**
 * ⚠️ VULNERABLE FUNCTION: Permissive JWT verification.
 * Does not strictly enforce algorithms or audience.
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

module.exports = {
  hashPassword,
  generateToken,
  verifyToken,
  JWT_SECRET,
  DEMO_STRIPE_TEST_KEY,
  DEMO_GITHUB_PAT
};
