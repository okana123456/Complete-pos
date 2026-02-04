#!/bin/bash

# DukaPOS Pro - Complete Project Setup Script
# This script creates all necessary files and directories for the production-ready POS system

echo "🚀 Setting up DukaPOS Pro - Production Ready"
echo "=============================================="

# Create all directories
echo "📁 Creating directory structure..."
mkdir -p backend/{models,routes,middleware,services,utils,scripts,config}
mkdir -p frontend/src/{components,pages,services,utils,styles}
mkdir -p public/{css,js,images}
mkdir -p docs
mkdir -p tests/{unit,integration}

echo "✅ Directory structure created"

# Create .gitignore
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment variables
.env
.env.local
.env.production

# Database
*.sql
backups/
*.db
*.sqlite

# Logs
logs/
*.log

# OS files
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo

# Build files
dist/
build/
.cache/

# Test coverage
coverage/
.nyc_output/

# Temporary files
tmp/
temp/
*.tmp
EOF

echo "✅ .gitignore created"

# Create environment template
cat > .env.example << 'EOF'
# Server Configuration
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:3001

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/dukapos_pro

# JWT Secret (generate a strong random string)
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRE=7d

# M-Pesa Integration
MPESA_CONSUMER_KEY=
MPESA_CONSUMER_SECRET=
MPESA_SHORTCODE=
MPESA_PASSKEY=
MPESA_CALLBACK_URL=https://yourdomain.com/api/mpesa/callback
MPESA_ENVIRONMENT=sandbox

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=
EMAIL_PASSWORD=

# Backup Configuration
BACKUP_ENABLED=true
BACKUP_SCHEDULE=0 2 * * *
BACKUP_RETENTION_DAYS=30

# Security
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
EOF

echo "✅ Environment template created"

# Create LICENSE
cat > LICENSE << 'EOF'
MIT License

Copyright (c) 2024 DukaPOS Pro

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
EOF

echo "✅ LICENSE created"

echo ""
echo "✨ Project structure created successfully!"
echo ""
echo "Next steps:"
echo "1. Copy .env.example to .env and configure your settings"
echo "2. Install dependencies: cd backend && npm install"
echo "3. Set up PostgreSQL database"
echo "4. Run migrations: npm run migrate"
echo "5. Start the server: npm run dev"
echo ""
echo "📖 See README.md for detailed instructions"
