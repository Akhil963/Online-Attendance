#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}==== Online Attendance System - Setup Script ====${NC}\n"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js is not installed. Please install Node.js first.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Node.js is installed${NC}"
echo "Node version: $(node --version)"
echo ""

# Backend Setup
echo -e "${YELLOW}Setting up Backend...${NC}"
cd backend

if [ ! -f ".env" ]; then
    echo -e "${YELLOW}Creating .env file from .env.example...${NC}"
    cp .env.example .env
    echo -e "${YELLOW}Please edit backend/.env with your configuration${NC}"
fi

echo "Installing backend dependencies..."
npm install

echo -e "${GREEN}✓ Backend setup complete${NC}\n"

# Frontend Setup
cd ..
cd frontend

if [ ! -f ".env" ]; then
    echo -e "${YELLOW}Creating .env file from .env.example...${NC}"
    cp .env.example .env
fi

echo "Installing frontend dependencies..."
npm install

echo -e "${GREEN}✓ Frontend setup complete${NC}\n"

cd ..

echo -e "${GREEN}==== Setup Complete ====${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Update backend/.env with your MongoDB and email configuration"
echo "2. Make sure MongoDB is running"
echo "3. Run: ${GREEN}npm run dev${NC} in backend directory"
echo "4. Run: ${GREEN}npm start${NC} in frontend directory"
echo ""
echo "Backend will run on http://localhost:5000"
echo "Frontend will run on http://localhost:3000"
