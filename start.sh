#!/bin/bash

# Arogya Card System Startup Script
echo "🏥 Starting Arogya Card System..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js (v16 or higher) first."
    exit 1
fi

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    print_warning "MongoDB is not running. Please start MongoDB first."
    print_status "You can start MongoDB with: sudo systemctl start mongod"
    print_status "Or with Docker: docker run -d -p 27017:27017 --name mongodb mongo:latest"
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

# Function to install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    # Install root dependencies
    print_status "Installing root dependencies..."
    npm install
    
    # Install server dependencies
    print_status "Installing server dependencies..."
    cd server
    npm install
    cd ..
    
    # Install client dependencies
    print_status "Installing client dependencies..."
    cd client
    npm install
    cd ..
    
    print_success "All dependencies installed successfully!"
}

# Function to check environment files
check_env_files() {
    print_status "Checking environment configuration..."
    
    if [ ! -f "server/.env" ]; then
        print_warning "Server .env file not found. Creating from template..."
        cp server/.env.example server/.env
        print_warning "Please edit server/.env with your configuration values."
    fi
    
    if [ ! -f "client/.env" ]; then
        print_warning "Client .env file not found. Creating default..."
        echo "REACT_APP_API_URL=http://localhost:5000/api" > client/.env
        echo "REACT_APP_APP_NAME=Arogya Card" >> client/.env
        echo "REACT_APP_VERSION=1.0.0" >> client/.env
    fi
    
    print_success "Environment files checked!"
}

# Function to create uploads directory
create_directories() {
    print_status "Creating necessary directories..."
    
    if [ ! -d "server/uploads" ]; then
        mkdir -p server/uploads
        print_status "Created uploads directory"
    fi
    
    print_success "Directories created!"
}

# Function to start the development servers
start_servers() {
    print_status "Starting development servers..."
    print_status "Backend will run on: http://localhost:5000"
    print_status "Frontend will run on: http://localhost:3000"
    print_status ""
    print_status "Press Ctrl+C to stop the servers"
    print_status ""
    
    # Start both servers concurrently
    npm run dev
}

# Main execution
main() {
    echo "=================================="
    echo "🏥 Arogya Card System Setup"
    echo "=================================="
    
    # Check if this is first run
    if [ ! -d "node_modules" ] || [ ! -d "server/node_modules" ] || [ ! -d "client/node_modules" ]; then
        print_status "First time setup detected..."
        install_dependencies
    fi
    
    check_env_files
    create_directories
    
    echo ""
    echo "=================================="
    echo "🚀 Starting Application"
    echo "=================================="
    
    start_servers
}

# Handle script interruption
trap 'print_status "Shutting down servers..."; exit 0' INT

# Run main function
main