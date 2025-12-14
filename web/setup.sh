#!/bin/bash

# AI Growth Planner - Frontend Setup & Run Script
# Usage: ./setup.sh

set -e

echo "🚀 AI Growth Planner - Frontend Setup"
echo "======================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+"
    exit 1
fi

# Check if pnpm is installed, if not install it
if ! command -v pnpm &> /dev/null; then
    echo "📦 Installing pnpm..."
    npm install -g pnpm
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ pnpm version: $(pnpm --version)"
echo ""

# Navigate to web directory
cd "$(dirname "$0")"

# Install dependencies
echo "📥 Installing dependencies..."
pnpm install

echo ""
echo "⚙️  Creating .env.local if it doesn't exist..."
if [ ! -f ".env.local" ]; then
    cp .env.local.example .env.local
    echo "✅ Created .env.local"
else
    echo "⏭️  .env.local already exists"
fi

echo ""
echo "✨ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Make sure the backend API is running on http://localhost:3000"
echo "2. Run: pnpm dev"
echo "3. Open: http://localhost:3001"
echo ""
echo "📚 For more info, see:"
echo "  - QUICK_START.md"
echo "  - FRONTEND_README.md"
echo ""
