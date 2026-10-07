# ⚠️ AADSec Demo — Intentionally Vulnerable Project

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![AADSec Audit Demo](https://img.shields.io/badge/AADSec-Demo%20Target-red.svg)](https://github.com/aadieng100/aadsec-public)

> **⚠️ WARNING: DO NOT DEPLOY — INTENTIONALLY VULNERABLE DEMO PROJECT**
>
> This repository is deliberately insecure and contains critical security flaws,
> including SQL injection, unrestricted file uploads, missing authorization,
> hardcoded fake secrets, and misconfigured cloud infrastructure.
>
> It is built **exclusively for local DevSecOps security audit demonstrations**
> with [**AADSec**](https://github.com/aadieng100/aadsec-public) and its integrated
> scanners (**Semgrep**, **Trivy**, **Gitleaks**, **Checkov**).

---

## 🎯 Purpose & Scope

When evaluating a security tool, engineers need a predictable, realistic testbed
that triggers real findings across multiple security disciplines:

1. **SAST** (Static Application Security Testing) — Source code flaws in JavaScript/Express.
2. **SCA** (Software Composition Analysis) — Vulnerable third-party npm packages.
3. **Secrets Detection** — Hardcoded API keys, database URLs, and private tokens.
4. **IaC Security** (Infrastructure as Code) — Permissive AWS Terraform resources.
5. **Container Security** — Outdated Docker base images and root execution.

All secrets and credentials in this repository are **completely synthetic and fake**.
They do not correspond to active systems and exist solely to trigger scanner rules.

---

## 📂 Repository Structure

```text
aadsec-demo-vulnerable/
├── app/
│   ├── package.json         # Outdated npm dependencies with known CVEs
│   ├── server.js            # Express entrypoint & sensitive debug endpoint
│   ├── routes/
│   │   ├── auth.js          # Weak MD5 auth & administrative backdoor
│   │   ├── upload.js        # Unrestricted arbitrary file upload & path traversal
│   │   └── user.js          # Direct SQL injection & missing authz admin route
│   └── lib/
│       ├── crypto.js        # Weak MD5 hashing, static JWT secret, fake API keys
│       └── db.js            # In-memory SQLite with raw SQL string concatenation
├── terraform/
│   ├── main.tf              # Overly permissive security group (0.0.0.0/0) & unencrypted EBS
│   ├── s3.tf                # Public S3 bucket (public-read) & disabled protection
│   └── iam.tf               # Excessive wildcard IAM policy (Action: *, Resource: *)
├── Dockerfile               # Outdated Node 14 Alpine image running as root with ENV secrets
├── .github/workflows/
│   └── aadsec-scan.yml      # GitHub Actions workflow for automated AADSec scans
├── .gitignore
├── LICENSE                  # MIT License
└── README.md
```

---

## 🔍 What Should Be Detected

When scanned with **AADSec**, this project produces findings across all four audit pillars:

| Pillar / Scanner | File / Location | Vulnerability Description | Severity |
| :--- | :--- | :--- | :--- |
| **SAST (Semgrep)** | `app/routes/user.js` | **SQL Injection** via string concatenation in `/api/users/search` | `P0 / Critical` |
| **SAST (Semgrep)** | `app/routes/upload.js` | **Arbitrary File Upload** without MIME validation or file size limit | `P1 / High` |
| **SAST (Semgrep)** | `app/routes/user.js` | **Missing Authorization** on `/api/admin/users` credential dump | `P1 / High` |
| **SAST (Semgrep)** | `app/lib/crypto.js` | **Weak Cryptographic Hash** (MD5 used for password storage) | `P2 / Medium` |
| **SAST (Semgrep)** | `app/server.js` | **Information Disclosure** via `/api/debug/env` leaking system env | `P2 / Medium` |
| **Secrets (Gitleaks)** | `app/lib/db.js` | Fake database connection string with password | `P0 / Critical` |
| **Secrets (Gitleaks)** | `app/lib/crypto.js` | Fake AWS Access Key & Stripe test token | `P0 / Critical` |
| **Secrets (Gitleaks)** | `Dockerfile` | Fake API tokens embedded in container `ENV` directives | `P1 / High` |
| **SCA (Trivy)** | `app/package.json` | Pinned packages: `body-parser 1.20.2` via `express 4.17.1` (ReDoS CVE-2024-45590), `jsonwebtoken 8.5.1` (CVE-2022-23529) | `P1 / High` |
| **Container (Trivy)** | `Dockerfile` | Outdated `node:14-alpine` base image with unpatched OS CVEs | `P1 / High` |
| **IaC (Checkov)** | `terraform/s3.tf` | Risky code configuration: S3 bucket with `public-read` ACL & disabled public block | `P0 / Critical` |
| **IaC (Checkov)** | `terraform/iam.tf` | Overly permissive IAM policy with wildcard `Action: *` | `P0 / Critical` |
| **IaC (Checkov)** | `terraform/main.tf` | Security Group ingress open to `0.0.0.0/0` on all ports & SSH | `P1 / High` |
| **IaC (Checkov)** | `terraform/main.tf` | Unencrypted EBS storage volume | `P2 / Medium` |

---

## 🚀 Running the Demo Application (Local Only)

### Option A: Using Node.js locally

> Requires Node.js 18+ and npm.

```bash
cd app
npm install
npm start
```

Open `http://localhost:3000` in your browser. You will see the demo landing page
with links to test each vulnerable endpoint:

- **SQL Injection test**: `http://localhost:3000/api/users/search?username=admin'%20OR%20'1'='1`
- **Credential dump**: `http://localhost:3000/api/admin/users`
- **Environment leak**: `http://localhost:3000/api/debug/env`

### Option B: Using Docker

```bash
docker build -t aadsec-demo-vulnerable .
docker run -p 3000:3000 --rm aadsec-demo-vulnerable
```

---

## 🛡️ Auditing with AADSec

[AADSec](https://github.com/aadieng100/aadsec-public) is a local-first DevSecOps audit tool.
It scans your workspace inside an isolated container runner without uploading code to any cloud.

### 1. Prerequisites

Ensure Docker Desktop (or Colima / Podman) is running, then pull the runner image:

```bash
docker pull ghcr.io/aadieng100/aadsec-runner:0.1.0-alpha.1
```

Verify your environment readiness:

```bash
aadsec doctor
```

### 2. Run the Full Security Audit

Navigate to the repository root and launch the scan:

```bash
# Full audit (Semgrep + Trivy + Gitleaks + Checkov)
aadsec scan .
```

By default, AADSec creates an isolated container, scans all files, and outputs:
- A human-readable executive summary in your terminal.
- An interactive, self-contained HTML report in `security-output/report.html`.
- A machine-readable JSON report in `security-output/report.json`.

### 3. Additional Scan Options

```bash
# Scan a specific container image:
aadsec scan --image aadsec-demo-vulnerable:latest

# Scan in 100% offline air-gapped mode (skips remote database downloads):
aadsec scan . --offline

# Specify custom output formats and directory:
aadsec scan . --format html,json --output ./audit-results

# Safely share only the anonymized findings bundle (never your source code):
aadsec share ./security-output/report.json
```

---

## 🎬 Suggested AADSec Demo Script (2-Minute Live Demo)

Here is a recommended script when demonstrating AADSec to developers, security leads, or clients:

```bash
# Step 1: Show that the environment is healthy
aadsec doctor

# Step 2: Run the scan on this demo repo (takes ~30-45 seconds)
aadsec scan .

# Step 3: View the generated report in your default browser
open security-output/report.html    # On macOS
# xdg-open security-output/report.html  # On Linux

# Step 4: Show that sharing is voluntary and anonymized (code never leaves machine)
aadsec share security-output/report.json --dry-run
```

**Key talking points during the demo:**
1. **Local-first guarantee**: Notice no code was sent to an LLM, remote SaaS, or external server.
2. **Unified triage**: Findings from 4 different scanners are normalized into a single P0–P3 priority scale.
3. **Actionable remediation**: Each finding in the HTML report includes the exact file line, business impact, and concrete code fix.

---

## ⚖️ License & Disclaimers

- **License**: Released under the [MIT License](LICENSE).
- **Disclaimer**: This codebase is **intentionally flawed** and must **never** be deployed to staging, testing, or production environments connected to the internet. Use solely on localhost for defensive DevSecOps training, benchmarking, and tool demonstrations.
