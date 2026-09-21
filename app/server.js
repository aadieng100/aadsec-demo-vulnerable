/**
 * AADSec Vulnerable Demo Server
 *
 * ⚠️ DO NOT DEPLOY — INTENTIONALLY VULNERABLE DEMO PROJECT
 * This application is designed solely for local security audit demonstrations
 * using AADSec, Semgrep, Trivy, Gitleaks, and Checkov.
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const os = require('os');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const uploadRoutes = require('./routes/upload');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Permissive CORS by default
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ⚠️ VULNERABILITY 6: Debug endpoint leaking sensitive environment and system info
app.get('/api/debug/env', (req, res) => {
  res.json({
    warning: 'Sensitive debug endpoint — should never be exposed in production',
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    cwd: process.cwd(),
    execPath: process.execPath,
    memoryUsage: process.memoryUsage(),
    env: process.env // Leaks all environment variables and secrets
  });
});

app.get('/api/debug/system', (req, res) => {
  res.json({
    hostname: os.hostname(),
    networkInterfaces: os.networkInterfaces(),
    uptime: os.uptime(),
    loadavg: os.loadavg(),
    userInfo: os.userInfo()
  });
});

// Mount modular routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/upload', uploadRoutes);

// Healthcheck
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'aadsec-demo-vulnerable',
    mode: 'intentionally-insecure-demo',
    timestamp: new Date().toISOString()
  });
});

// Friendly root landing page listing all endpoints for manual testing
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>AADSec Demo Vulnerable App</title>
      <style>
        body { font-family: system-ui, -apple-system, sans-serif; max-width: 800px; margin: 2rem auto; padding: 0 1rem; line-height: 1.6; background: #0b0f19; color: #f3f4f6; }
        h1 { color: #f87171; border-bottom: 2px solid #dc2626; padding-bottom: 0.5rem; }
        .banner { background: #450a0a; border-left: 5px solid #ef4444; padding: 1rem; border-radius: 6px; margin: 1.5rem 0; }
        code { background: #1f2937; padding: 0.2rem 0.4rem; border-radius: 4px; color: #38bdf8; font-family: monospace; }
        ul { line-height: 2; }
        a { color: #60a5fa; text-decoration: none; }
        a:hover { text-decoration: underline; }
      </style>
    </head>
    <body>
      <h1>⚠️ AADSec Demo Vulnerable Application</h1>
      <div class="banner">
        <strong>DO NOT DEPLOY:</strong> This application is deliberately vulnerable. It exists solely to demonstrate DevSecOps auditing with <strong>AADSec</strong> (Semgrep, Trivy, Gitleaks, Checkov).
      </div>

      <h2>Available Demo Endpoints:</h2>
      <ul>
        <li><code>GET /health</code> — Basic health check (<a href="/health">view</a>)</li>
        <li><code>GET /api/users/search?username=admin' OR '1'='1</code> — <span style="color:#f87171">SQL Injection</span> (<a href="/api/users/search?username=admin' OR '1'='1">test query</a>)</li>
        <li><code>GET /api/admin/users</code> — <span style="color:#f87171">Missing Authorization</span>, leaks all hashes & keys (<a href="/api/admin/users">view</a>)</li>
        <li><code>GET /api/debug/env</code> — <span style="color:#f87171">Information Disclosure</span>, leaks process.env (<a href="/api/debug/env">view</a>)</li>
        <li><code>POST /api/upload</code> — Unrestricted file upload</li>
        <li><code>POST /api/auth/login</code> — Weak MD5 auth & hardcoded backdoor</li>
      </ul>

      <p>Audit this codebase locally with: <code>aadsec scan .</code></p>
    </body>
    </html>
  `);
});

// Start listening
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`⚠️  AADSec Vulnerable Demo App running on port ${PORT}`);
    console.log(`⚠️  DO NOT DEPLOY IN PRODUCTION — INTENTIONALLY INSECURE`);
    console.log(`=======================================================`);
  });
}

module.exports = app;
