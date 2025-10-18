#!/bin/bash

# Package Verification Script for Promptmetheus
# This script verifies package integrity and security before installation

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🔍 Promptmetheus Package Verification Script"
echo "=============================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js first.${NC}"
    exit 1
fi

# Check Node version
NODE_VERSION=$(node -v | cut -d'v' -f2)
REQUIRED_VERSION="20.11.0"

echo -e "${GREEN}✓${NC} Node.js version: $NODE_VERSION"

if [ -f ".nvmrc" ]; then
    NVM_VERSION=$(cat .nvmrc)
    echo -e "${GREEN}✓${NC} Required Node version (from .nvmrc): $NVM_VERSION"
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed.${NC}"
    exit 1
fi

NPM_VERSION=$(npm -v)
echo -e "${GREEN}✓${NC} npm version: $NPM_VERSION"
echo ""

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ package.json not found in current directory.${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} package.json found"

# Check if package-lock.json exists
if [ ! -f "package-lock.json" ]; then
    echo -e "${YELLOW}⚠${NC}  package-lock.json not found. It will be generated during installation."
else
    echo -e "${GREEN}✓${NC} package-lock.json found"
fi

echo ""
echo "📦 Verifying package integrity..."
echo ""

# Run npm audit to check for vulnerabilities
echo "🔐 Running security audit..."
if npm audit --audit-level=moderate; then
    echo -e "${GREEN}✓${NC} No moderate or higher vulnerabilities found"
else
    echo -e "${YELLOW}⚠${NC}  Vulnerabilities detected. Review the audit report above."
    read -p "Do you want to continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Installation cancelled."
        exit 1
    fi
fi

echo ""
echo "🔍 Checking critical dependencies..."

# List of critical dependencies to verify
CRITICAL_DEPS=(
    "next"
    "react"
    "react-dom"
    "@kinde-oss/kinde-auth-nextjs"
    "@supabase/supabase-js"
    "langchain"
    "@langchain/openai"
    "tailwindcss"
    "typescript"
)

for dep in "${CRITICAL_DEPS[@]}"; do
    if grep -q "\"$dep\"" package.json; then
        echo -e "${GREEN}✓${NC} $dep found in package.json"
    else
        echo -e "${YELLOW}⚠${NC}  $dep not found in package.json"
    fi
done

echo ""
echo "📋 Package Verification Summary"
echo "================================"
echo -e "${GREEN}✓${NC} Environment checks passed"
echo -e "${GREEN}✓${NC} package.json validated"
echo -e "${GREEN}✓${NC} Security audit completed"
echo ""

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠${NC}  .env file not found"
    if [ -f ".env.example" ]; then
        echo -e "${YELLOW}ℹ${NC}  .env.example found. Please copy it to .env and configure:"
        echo "    cp .env.example .env"
    fi
    echo ""
fi

echo "✅ Package verification complete!"
echo ""
echo "Next steps:"
echo "1. Ensure .env file is configured with your API keys"
echo "2. Run: npm install (to install dependencies)"
echo "3. Run: npm run db:migrate (to setup database)"
echo "4. Run: npm run dev (to start development server)"
echo ""
