#!/bin/bash

# Script to resolve stale commit issues on main branch
# Usage: ./sync-main-branch.sh

set -e

echo "🔄 Resolving stale commit issue on main branch..."

# Store current branch
CURRENT_BRANCH=$(git branch --show-current)
echo "📍 Current branch: $CURRENT_BRANCH"

# Fetch latest from origin
echo "🌐 Fetching latest from origin..."
git fetch origin

# Check if main branch exists locally
if git show-ref --verify --quiet refs/heads/main; then
    echo "✅ Local main branch exists"
else
    echo "🔧 Creating local main branch from origin..."
    git fetch origin main:main
fi

# Switch to main branch
echo "🔀 Switching to main branch..."
git checkout main

# Reset any uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo "⚠️  Uncommitted changes found. Resetting..."
    git reset --hard HEAD
else
    echo "✅ Working tree is clean"
fi

# Pull latest from origin
echo "⬇️  Pulling latest from origin/main..."
git pull origin main

# Verify status
echo "📊 Current status:"
git status --porcelain
git log --oneline -3

# Switch back to original branch if it wasn't main
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "🔙 Switching back to $CURRENT_BRANCH..."
    git checkout "$CURRENT_BRANCH"
fi

echo "✅ Main branch sync completed successfully!"
echo "📋 Summary:"
echo "   - Main branch is now in sync with origin/main"
echo "   - No uncommitted changes on main"
echo "   - Ready for new development work"