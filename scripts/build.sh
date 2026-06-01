#!/bin/bash

if [ -z "$VERCEL" ]; then
  npm run build
  exit $?
fi

CHANGED_FILES=$(git diff HEAD~1 --name-only)

DOC_ONLY=$(echo "$CHANGED_FILES" | grep -v -E '\.(md|txt)$')

if [ -z "$DOC_ONLY" ]; then
  echo "⚠️  Only documentation files changed. Skipping build."
  exit 0
fi

echo "🔨  Building project..."
npm run build
exit $?
