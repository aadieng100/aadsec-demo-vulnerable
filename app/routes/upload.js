/**
 * File Upload Routes
 *
 * ⚠️ VULNERABILITY DEMONSTRATION ONLY:
 * 1. Arbitrary File Upload (No MIME-type verification, no extension whitelist).
 * 2. Unrestricted File Size (Denial of Service / Disk exhaustion).
 * 3. Path Traversal when reading files by user-provided name.
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const UPLOAD_DIR = path.resolve(__dirname, '../../uploads');

// Ensure upload folder exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// ⚠️ VULNERABLE STORAGE CONFIGURATION:
// - Retains original file name without sanitization
// - No destination isolation
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    // Retaining unsanitized original filename allows dangerous extensions
    cb(null, file.originalname);
  }
});

// ⚠️ VULNERABILITY 2: Missing fileFilter and missing limits (no file size limit)
const upload = multer({
  storage: storage
  // Missing: limits: { fileSize: 2 * 1024 * 1024 }
  // Missing: fileFilter: (req, file, cb) => { ... }
});

/**
 * POST /api/upload
 * Allows uploading any file type (.sh, .exe, .html, .js) with unlimited size.
 */
router.post('/', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file provided in form-data field "file"' });
  }

  res.json({
    success: true,
    message: 'File uploaded successfully without validation',
    filename: req.file.filename,
    size: req.file.size,
    destination: req.file.destination,
    warning: 'MIME type and extension were not validated.'
  });
});

/**
 * GET /api/upload/:filename
 * ⚠️ VULNERABILITY: Path traversal risk
 * Directly joining user-controlled filename parameter.
 */
router.get('/:filename', (req, res) => {
  const filename = req.params.filename;
  // Vulnerable to path traversal: e.g. ../../package.json
  const targetPath = path.join(UPLOAD_DIR, filename);

  if (!fs.existsSync(targetPath)) {
    return res.status(404).json({ error: 'File not found' });
  }

  res.sendFile(targetPath);
});

module.exports = router;
