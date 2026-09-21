# =============================================================================
# AADSec Demo Dockerfile — Intentionally Insecure Container Image
# ⚠️ DO NOT USE IN PRODUCTION — DEMONSTRATION ONLY
#
# Flaws demonstrated for Trivy / Checkov container audits:
# 1. Outdated base image (node:14-alpine) with known unpatched OS vulnerabilities.
# 2. Container runs as root (missing non-root USER instruction).
# 3. Hardcoded fake credentials embedded in ENV directives.
# 4. Inefficient caching (copying entire context before dependency install).
# 5. Missing HEALTHCHECK instruction.
# =============================================================================

FROM node:14-alpine

# ⚠️ Bad practice: Storing secrets / sensitive tokens directly in image environment
ENV NODE_ENV=production
ENV PORT=3000
ENV DEMO_ADMIN_SECRET=aadsec_fake_demo_secret_token_99999
ENV DATABASE_PASSWORD=SuperInsecureRootPassDemo2026!

WORKDIR /usr/src/app

# ⚠️ Bad practice: Copying all source code before installing dependencies (busts cache)
COPY . .

# Install dependencies inside container
WORKDIR /usr/src/app/app
RUN npm install --production --silent

WORKDIR /usr/src/app

# ⚠️ Bad practice: Running container as ROOT user (no USER node directive)
EXPOSE 3000

CMD ["node", "app/server.js"]
