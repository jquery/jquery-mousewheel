#!/bin/sh

set -euo pipefail

# Install dependencies
npm ci

# Clean all release and build artifacts
npm run build:clean

# Run tests
npm test
