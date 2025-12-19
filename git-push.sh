#!/bin/bash

# Script to push changes to GitHub after OneDrive unlocks files
# Usage: bash git-push.sh

echo "Waiting for OneDrive to unlock files..."
sleep 5

echo "Removing lock files..."
rm -f .git/index.lock .git/HEAD.lock

echo "Checking git status..."
if ! git status &>/dev/null; then
    echo "Git index is corrupted, rebuilding..."
    rm -f .git/index
    git reset --mixed HEAD 2>/dev/null || git read-tree HEAD 2>/dev/null
fi

echo "Adding modified file..."
git add src/components/PerformanceMetrics.jsx

echo "Committing changes..."
git commit -m "Fix performance metrics calculations - correct Maximum Drawdown, Sharpe Ratio, TWR, and MWR (IRR)"

echo "Pushing to GitHub..."
git push origin main

echo "Done!"
