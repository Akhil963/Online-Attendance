#!/bin/bash

# Production Deployment Setup Script
# Run this on your production server before starting the application

set -e

echo "🚀 Starting Production Setup..."

# Check Node.js version
echo "✓ Checking Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+ first."
    exit 1
fi
NODE_VERSION=$(node -v)
echo "  Found: $NODE_VERSION"

# Check npm version
echo "✓ Checking npm..."
NPM_VERSION=$(npm -v)
echo "  Found: npm $NPM_VERSION"

# Check MongoDB connection
echo "✓ Testing MongoDB connection..."
if [ -z "$MONGODB_URI" ]; then
    echo "❌ MONGODB_URI not set!"
    echo "   Set it and try again: export MONGODB_URI=mongodb+srv://..."
    exit 1
fi

# Install backend dependencies
echo "✓ Installing backend dependencies..."
cd backend
npm ci --production

# Check required environment variables
echo "✓ Validating environment variables..."
REQUIRED_VARS=("JWT_SECRET" "MONGODB_URI" "SENDGRID_API_KEY" "SENDGRID_FROM_EMAIL")
for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Missing required variable: $var"
        exit 1
    fi
    echo "  ✓ $var is set"
done

# Install frontend dependencies
echo "✓ Installing frontend dependencies..."
cd ../frontend
npm ci --production

# Build frontend
echo "✓ Building frontend..."
npm run build

# Return to root
cd ..

# Create logs directory if it doesn't exist
echo "✓ Setting up logs directory..."
mkdir -p backend/logs

# Set proper permissions
chmod 755 backend/logs
chmod 755 backend/uploads
chmod 755 backend/uploads/profile-pictures

echo ""
echo "✅ Production setup complete!"
echo ""
echo "Next steps:"
echo "1. Verify all environment variables are set correctly"
echo "2. Ensure MongoDB Atlas cluster is accessible"
echo "3. Test database connection: npm run test:db"
echo "4. Start backend server: cd backend && npm start"
echo "5. Point frontend to: http://localhost:3000 (or your domain)"
echo ""
echo "For troubleshooting, check:"
echo "- Backend logs: backend/logs/*.log"
echo "- MongoDB connection in backend/server.js"
echo "- CORS configuration for frontend domain"
