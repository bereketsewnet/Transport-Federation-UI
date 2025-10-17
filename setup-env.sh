#!/bin/bash

# Environment Setup Script
# This script helps you create .env files from templates

echo "================================================"
echo "  Environment Configuration Setup"
echo "================================================"
echo ""

# Check if templates exist
if [ ! -f "env-templates/env.development.template" ]; then
    echo "❌ Error: Template files not found in env-templates/"
    exit 1
fi

# Setup development environment
if [ -f ".env.development" ]; then
    echo "⚠️  .env.development already exists"
    read -p "   Do you want to overwrite it? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cp env-templates/env.development.template .env.development
        echo "✅ .env.development created"
    else
        echo "⏭️  Skipped .env.development"
    fi
else
    cp env-templates/env.development.template .env.development
    echo "✅ .env.development created"
fi

echo ""

# Setup production environment
if [ -f ".env.production" ]; then
    echo "⚠️  .env.production already exists"
    read -p "   Do you want to overwrite it? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cp env-templates/env.production.template .env.production
        echo "✅ .env.production created"
    else
        echo "⏭️  Skipped .env.production"
    fi
else
    cp env-templates/env.production.template .env.production
    echo "✅ .env.production created"
fi

echo ""
echo "================================================"
echo "  Setup Complete!"
echo "================================================"
echo ""
echo "📝 Next Steps:"
echo ""
echo "1. Edit .env.production and set your backend URL:"
echo "   nano .env.production"
echo "   or"
echo "   code .env.production"
echo ""
echo "2. Replace this line:"
echo "   VITE_API_BASE_URL=https://api.yourdomain.com"
echo "   with your actual backend URL"
echo ""
echo "3. Build for production:"
echo "   npm run build"
echo ""
echo "4. Deploy the dist/ folder to your hosting"
echo ""
echo "================================================"

