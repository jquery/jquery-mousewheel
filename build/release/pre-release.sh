#!/bin/sh

set -euo pipefail

read -p "Press enter if you updated CHANGELOG.md; abort otherwise"

# Install dependencies
npm ci

# Clean all release and build artifacts
npm run build:clean

# Run tests
npm test
