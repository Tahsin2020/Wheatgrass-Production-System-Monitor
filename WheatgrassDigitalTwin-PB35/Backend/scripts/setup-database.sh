#!/bin/bash

# PostgreSQL Database Setup Script for Wheatgrass Monitor
# This script helps set up the PostgreSQL database

set -e

echo "🌾 Wheatgrass Monitor - PostgreSQL Setup"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if PostgreSQL is installed
echo "Checking PostgreSQL installation..."
if command -v psql &> /dev/null; then
    echo -e "${GREEN}✓${NC} PostgreSQL is installed"
    psql --version
else
    echo -e "${YELLOW}⚠${NC} PostgreSQL is not installed"
    echo ""
    echo "Please install PostgreSQL:"
    echo ""
    
    # Detect OS and provide installation instructions
    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo "macOS detected. Install with Homebrew:"
        echo "  brew install postgresql@15"
        echo "  brew services start postgresql@15"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        echo "Linux detected. Install with:"
        echo "  sudo apt update"
        echo "  sudo apt install postgresql postgresql-contrib"
        echo "  sudo systemctl start postgresql"
    else
        echo "Visit: https://www.postgresql.org/download/"
    fi
    
    exit 1
fi

echo ""

# Check if PostgreSQL is running
echo "Checking if PostgreSQL is running..."
if pg_isready &> /dev/null; then
    echo -e "${GREEN}✓${NC} PostgreSQL is running"
else
    echo -e "${RED}✗${NC} PostgreSQL is not running"
    echo ""
    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo "Start PostgreSQL with:"
        echo "  brew services start postgresql@15"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        echo "Start PostgreSQL with:"
        echo "  sudo systemctl start postgresql"
    fi
    exit 1
fi

echo ""

# Database name
DB_NAME="wheatgrass_monitor"

# Check if database exists
echo "Checking if database '$DB_NAME' exists..."
if psql -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
    echo -e "${GREEN}✓${NC} Database '$DB_NAME' already exists"
else
    echo -e "${YELLOW}⚠${NC} Database '$DB_NAME' does not exist"
    echo ""
    read -p "Create database '$DB_NAME'? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        createdb "$DB_NAME"
        echo -e "${GREEN}✓${NC} Database '$DB_NAME' created"
    else
        echo "Skipping database creation"
        exit 1
    fi
fi

echo ""

# Check if .env file exists
echo "Checking environment configuration..."
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠${NC} .env file not found"
    
    if [ -f ".env.example" ]; then
        read -p "Copy .env.example to .env? (y/n) " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            cp .env.example .env
            echo -e "${GREEN}✓${NC} Created .env from .env.example"
            echo ""
            echo "Please edit .env and set your database credentials:"
            echo "  - DB_HOST (default: localhost)"
            echo "  - DB_PORT (default: 5432)"
            echo "  - DB_NAME (default: wheatgrass_monitor)"
            echo "  - DB_USER (default: postgres)"
            echo "  - DB_PASSWORD"
        else
            echo "Please create .env file manually"
            exit 1
        fi
    else
        echo "Please create .env file with database configuration"
        exit 1
    fi
else
    echo -e "${GREEN}✓${NC} .env file exists"
fi

echo ""

# Initialize database schema
echo "Initializing database schema..."
read -p "Run database initialization? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    npm run db:init
    echo ""
    echo -e "${GREEN}✓${NC} Database schema initialized"
else
    echo "Skipping database initialization"
    echo "Run manually with: npm run db:init"
fi

echo ""

# Test database connection
echo "Testing database connection..."
read -p "Run database tests? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    npm run test:db
else
    echo "Skipping database tests"
    echo "Run manually with: npm run test:db"
fi

echo ""
echo "========================================"
echo -e "${GREEN}Setup Complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Review your .env file and update database credentials if needed"
echo "2. Start the server: npm start"
echo "3. Sensor data will automatically be saved to PostgreSQL"
echo "4. Historical charts will display data from the database"
echo ""
echo "For more information, see:"
echo "  - DATABASE_SETUP.md (detailed setup guide)"
echo "  - POSTGRES_IMPLEMENTATION.md (implementation details)"
echo ""
