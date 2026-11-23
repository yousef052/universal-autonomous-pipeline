#!/usr/bin/env bash
# Universal Autonomous Pipeline (UAP) - Unix/macOS One-Liner Installer
set -e

echo -e "\033[36m=== Installing Universal Autonomous Pipeline (UAP) ===\033[0m"

# 1. Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "\033[31m[ERROR] Node.js is not installed or not in PATH.\033[0m"
    echo -e "\033[33mPlease install Node.js (v18+) from https://nodejs.org\033[0m"
    exit 1
fi

NODE_VER=$(node -v)
echo -e "\033[32m  -> Node.js detected: ${NODE_VER}\033[0m"

# 2. Launch UAP Interactive Experience
echo -e "\033[35m  -> Launching UAP Interactive Guided Experience...\033[0m"
npx universal-autonomous-pipeline@latest
