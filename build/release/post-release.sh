#!/bin/sh

set -euo pipefail

# $1: Version

dist=tmp/release/dist

if [[ -z "$1" ]] then
	echo "Version is not set (1st argument)"
	exit 1
fi

if [[ -z "$2" ]] then
	echo "Blog URL is not set (2nd argument)"
	exit 1
fi

# Restore AUTHORS URL
sed -i "s/$1\/AUTHORS.txt/main\/AUTHORS.txt/" package.json
git add package.json

# Remove built files from tracking.
npm run build:clean
git rm --cached -r dist/
git commit -m "Release: remove dist files from main branch"

# Wait for confirmation from user to push changes
read -p "Press enter to push changes to main branch"
git push
