#!/usr/bin/env bash

echo "🔥 Cleaning node_modules and lock file..."
rm -rf node_modules package-lock.json

echo "📦 Running npm install..."
npm install
